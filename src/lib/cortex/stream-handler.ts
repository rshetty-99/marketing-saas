/**
 * Cortex Stream Handler — Orchestrates the full SSE streaming pipeline
 * POST → Intent classify → Context assemble → Claude stream → Tool execute → SSE response
 */

import Anthropic from '@anthropic-ai/sdk';
import { classifyIntent } from './intent-classifier';
import { assembleContext } from './context-assembler';
import { executeTool } from './tool-executor';
import { CORTEX_TOOLS } from './tool-definitions';
import { createSession, addMessage, getSessionMessages, updateSessionTitle } from './cortex-service';
import type { CortexToolCall } from '@/types/features/cortex';

interface StreamParams {
  workspaceId: string;
  userId: string;
  message: string;
  sessionId?: string;
  inputMethod: string;
  clientId?: string;
  isQuickCommand: boolean;
}

export async function handleCortexStream(params: StreamParams): Promise<ReadableStream> {
  const { workspaceId, userId, message, clientId } = params;

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function sendEvent(type: string, data: unknown) {
        try {
          const payload = typeof data === 'object' && data !== null ? { type, ...data as Record<string, unknown> } : { type, data };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // Controller may be closed if client disconnected
        }
      }

      try {
        const anthropic = new Anthropic();

        // 1. Ensure session
        let sessionId = params.sessionId;
        if (!sessionId) {
          sessionId = await createSession(workspaceId, userId, clientId);
          sendEvent('session_created', { sessionId });
        }

        // 2. Save user message
        await addMessage(workspaceId, sessionId, {
          role: 'user', content: message, inputMethod: params.inputMethod,
        }, userId);

        // 3. Pass 1 — Intent classification
        const intent = await classifyIntent(message, anthropic);

        // 4. Pass 2 — Context assembly
        const { systemPrompt } = await assembleContext(workspaceId, userId, clientId, intent);

        // 5. Load session history for multi-turn context
        const history = await getSessionMessages(workspaceId, sessionId, 20);
        const claudeMessages: Anthropic.MessageParam[] = (history as Record<string, unknown>[])
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content as string,
          }));

        // 6. Stream Claude response
        let fullResponse = '';
        const toolCalls: CortexToolCall[] = [];
        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        const MAX_TOOL_DEPTH = 5;

        // Recursive function to handle tool use loops (depth-limited)
        async function streamWithTools(messages: Anthropic.MessageParam[], depth: number = 0) {
          if (depth >= MAX_TOOL_DEPTH) {
            sendEvent('error', { message: 'Tool loop limit reached. Please simplify your request.' });
            return;
          }
          const stream = anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: systemPrompt,
            messages,
            tools: CORTEX_TOOLS,
          });

          const response = await stream.finalMessage();
          totalInputTokens += response.usage?.input_tokens ?? 0;
          totalOutputTokens += response.usage?.output_tokens ?? 0;

          // Process content blocks
          const toolResults: Anthropic.MessageParam[] = [];
          let hasToolUse = false;

          for (const block of response.content) {
            if (block.type === 'text') {
              sendEvent('text_delta', { content: block.text });
              fullResponse += block.text;
            }

            if (block.type === 'tool_use') {
              hasToolUse = true;
              sendEvent('tool_call_start', { toolName: block.name, arguments: block.input });

              try {
                const { result, durationMs } = await executeTool(
                  block.name,
                  block.input as Record<string, unknown>,
                  workspaceId,
                );
                sendEvent('tool_call_result', { toolName: block.name, result, durationMs });
                toolCalls.push({
                  toolName: block.name,
                  arguments: block.input as Record<string, unknown>,
                  result, status: 'completed', executionMode: 'direct_service', durationMs,
                });

                // Build tool result for Claude
                toolResults.push({
                  role: 'user',
                  content: [{
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: JSON.stringify(result),
                  }],
                } as Anthropic.MessageParam);
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Tool execution failed';
                sendEvent('tool_call_result', { toolName: block.name, error: errorMsg, durationMs: 0 });
                toolCalls.push({
                  toolName: block.name,
                  arguments: block.input as Record<string, unknown>,
                  status: 'failed', executionMode: 'direct_service', error: errorMsg,
                });

                toolResults.push({
                  role: 'user',
                  content: [{
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: JSON.stringify({ error: errorMsg }),
                    is_error: true,
                  }],
                } as Anthropic.MessageParam);
              }
            }
          }

          // If there were tool uses, continue the conversation with tool results
          if (hasToolUse && toolResults.length > 0) {
            const continuedMessages: Anthropic.MessageParam[] = [
              ...messages,
              { role: 'assistant', content: response.content },
              ...toolResults,
            ];
            await streamWithTools(continuedMessages, depth + 1);
          }
        }

        await streamWithTools(claudeMessages);

        // 7. Auto-title the session from first message
        if ((history as unknown[]).length <= 1) {
          const title = message.length > 60 ? message.slice(0, 57) + '...' : message;
          updateSessionTitle(workspaceId, sessionId, title).catch(() => {});
        }

        // 8. Save assistant message (async, non-blocking)
        addMessage(workspaceId, sessionId, {
          role: 'assistant', content: fullResponse,
          toolCalls: toolCalls.length > 0 ? toolCalls as unknown as Record<string, unknown>[] : undefined,
          tokenUsage: { input: totalInputTokens, output: totalOutputTokens },
        }, 'cortex').catch(() => {});

        // 9. Done
        sendEvent('done', {
          sessionId,
          tokenUsage: { input: totalInputTokens, output: totalOutputTokens },
          creditsConsumed: 0, // Reads are free in Phase 11A
          toolsUsed: toolCalls.map((t) => t.toolName),
        });

        controller.close();
      } catch (error) {
        sendEvent('error', {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        });
        controller.close();
      }
    },
  });
}
