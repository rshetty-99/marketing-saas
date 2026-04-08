'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react';

interface BlogEditorProps {
  content?: Record<string, unknown>;
  onChange?: (json: Record<string, unknown>, html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function BlogEditor({
  content,
  onChange,
  readOnly = false,
  placeholder = 'Start writing your post...',
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-orange underline decoration-brand-orange/30 hover:decoration-brand-orange',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content: content ?? undefined,
    editable: !readOnly,
    onUpdate: ({ editor: e }) => {
      if (onChange) {
        onChange(e.getJSON() as Record<string, unknown>, e.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg dark:prose-invert max-w-none min-h-[400px] px-4 py-3 focus:outline-none prose-headings:font-display prose-headings:font-semibold prose-a:text-brand-orange prose-blockquote:border-l-brand-orange prose-img:rounded-xl',
      },
    },
  });

  const insertImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL:', previousUrl ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[400px] rounded-lg border border-border bg-card animate-pulse" data-testid="blog-editor-loading" />
    );
  }

  const wordCount = editor.storage.characterCount.words() as number;
  const charCount = editor.storage.characterCount.characters() as number;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden" data-testid="blog-editor">
      {/* Toolbar */}
      {!readOnly && (
        <div
          className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5"
          data-testid="blog-editor-toolbar"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="size-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="size-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="size-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton onClick={insertImage} active={false} title="Insert Image">
            <ImageIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={insertLink}
            active={editor.isActive('link')}
            title="Insert Link"
          >
            <LinkIcon className="size-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            active={false}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            active={false}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="size-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Character and word count */}
      <div
        className="flex items-center justify-end gap-3 border-t border-border px-3 py-1.5 text-xs text-muted-foreground"
        data-testid="blog-editor-stats"
      >
        <span data-testid="blog-editor-word-count">{wordCount} words</span>
        <span data-testid="blog-editor-char-count">{charCount} characters</span>
        <span>~{Math.ceil(wordCount / 200)} min read</span>
      </div>
    </div>
  );
}

// ── Toolbar sub-components ─────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  active: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-7 w-7 p-0 ${active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {children}
    </Button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-1 h-4 w-px bg-border" />;
}
