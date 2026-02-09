"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlock from "@tiptap/extension-code-block";

const STORAGE_KEY = "floatynotey:content";
const DEFAULT_CONTENT = "<p>Start typing...</p>";

function loadContent(): string {
  if (typeof window === "undefined") return DEFAULT_CONTENT;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_CONTENT;
}

export default function Editor() {
  const [initialContent] = useState(loadContent);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlock,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose dark:prose-invert max-w-none outline-none min-h-[calc(100vh-2rem)] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      localStorage.setItem(STORAGE_KEY, editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
}
