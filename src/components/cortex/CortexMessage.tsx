'use client';

import { motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';
import { CortexFeedback } from './CortexFeedback';

interface ToolCall {
  name: string;
  status: 'running' | 'complete' | 'error';
}

interface CortexMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: number;
}

interface CortexMessageProps {
  message: CortexMessageData;
  isStreaming?: boolean;
  onFeedback?: (messageId: string, feedback: { rating: 'positive' | 'negative'; reason?: string }) => void;
}

export function CortexMessage({
  message,
  isStreaming = false,
  onFeedback,
}: CortexMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      data-testid={isUser ? 'cortex-message-user' : 'cortex-message-assistant'}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 px-4 py-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-brand-indigo">
          <Bot className="size-3.5 text-white" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-brand-orange/10 text-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {/* Tool call indicators */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-2 flex flex-col gap-1">
            {message.toolCalls.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                data-testid={`cortex-tool-call-${tool.name}`}
              >
                {tool.status === 'running' && (
                  <Loader2 className="size-3 animate-spin" />
                )}
                {tool.status === 'complete' && (
                  <span className="size-3 text-center text-success">&#10003;</span>
                )}
                {tool.status === 'error' && (
                  <span className="size-3 text-center text-destructive">&#10007;</span>
                )}
                <span className="font-ui">{tool.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        <div className="whitespace-pre-wrap break-words font-body">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-foreground animate-pulse align-text-bottom" />
          )}
        </div>

        {/* Feedback for assistant messages */}
        {!isUser && !isStreaming && onFeedback && (
          <CortexFeedback messageId={message.id} onSubmit={onFeedback} />
        )}
      </div>
    </motion.div>
  );
}

export type { CortexMessageData, ToolCall };
