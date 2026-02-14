"use client";

import type { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor;
  onRequestLink?: (selection: { from: number; to: number }) => void;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`toolbar-btn ${active ? "active" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="toolbar-divider" />;
}

export default function Toolbar({ editor, onRequestLink }: ToolbarProps) {
  return (
    <div className="toolbar">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (⌘B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (⌘I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
      >
        <code>&lt;/&gt;</code>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="3" cy="4" r="1.5" />
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="3" cy="12" r="1.5" />
          <rect x="6" y="3" width="9" height="2" rx="0.5" />
          <rect x="6" y="7" width="9" height="2" rx="0.5" />
          <rect x="6" y="11" width="9" height="2" rx="0.5" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <text x="1" y="5.5" fontSize="5" fontWeight="600">1</text>
          <text x="1" y="9.5" fontSize="5" fontWeight="600">2</text>
          <text x="1" y="13.5" fontSize="5" fontWeight="600">3</text>
          <rect x="6" y="3" width="9" height="2" rx="0.5" />
          <rect x="6" y="7" width="9" height="2" rx="0.5" />
          <rect x="6" y="11" width="9" height="2" rx="0.5" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        title="Checklist"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M2.5 4.5L3.5 5.5L5.5 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="1" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <rect x="8" y="3.5" width="7" height="2" rx="0.5" />
          <rect x="8" y="10.5" width="7" height="2" rx="0.5" />
        </svg>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5,3 1,8 5,13" />
          <polyline points="11,3 15,8 11,13" />
          <line x1="9" y1="2" x2="7" y2="14" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 3C1.5 3 1 4 1 5.5S1.5 8 3 8C4.5 8 4.5 9.5 3 11H4.5C6.5 9.5 6.5 6 5 4.5C4.5 3.5 4 3 3 3Z" />
          <path d="M10 3C8.5 3 8 4 8 5.5S8.5 8 10 8C11.5 8 11.5 9.5 10 11H11.5C13.5 9.5 13.5 6 12 4.5C11.5 3.5 11 3 10 3Z" />
        </svg>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
          } else {
            const { from, to } = editor.state.selection;
            if (from === to) return; // No text selected
            onRequestLink?.({ from, to });
          }
        }}
        active={editor.isActive("link")}
        title="Link"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" />
          <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" />
        </svg>
      </ToolbarButton>
    </div>
  );
}
