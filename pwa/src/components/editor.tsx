"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import { db } from "@/lib/db";
import { createNote, getNote, updateNote, deleteNote } from "@/lib/notes";
import { migrateIfNeeded } from "@/lib/migrate";
import { pushHistory, goBack, goForward } from "@/lib/history";
import { isInternalNoteUrl, parseNoteHash } from "@/lib/deep-link";
import CommandPalette from "./command-palette";
import Toolbar from "./toolbar";

const LAST_NOTE_KEY = "floatynotey:lastNote";
const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

function LinkInput({
  top,
  left,
  onSubmit,
  onCancel,
}: {
  top: number;
  left: number;
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type="url"
      placeholder="Paste or type a URL…"
      className="fixed z-50 rounded border border-neutral-300 bg-white px-2 py-1 text-sm shadow-lg outline-none focus:border-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
      style={{ top, left, minWidth: 240 }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const val = inputRef.current?.value.trim();
          if (val) onSubmit(val);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      onBlur={onCancel}
    />
  );
}

export default function Editor() {
  const [ready, setReady] = useState(false);
  const [noteId, setNoteId] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSelectNoteRef = useRef<((id: number) => void) | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlock,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: null,
        },
      }),
    ],
    content: EMPTY_DOC,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose dark:prose-invert max-w-none outline-none min-h-[calc(100vh-2rem)] p-4 pb-12",
      },
    },
    onUpdate: ({ editor }) => {
      // Debounced save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const id = noteIdRef.current;
        if (id != null) {
          updateNote(id, { content: editor.getJSON() });
        }
      }, 300);
    },
  });

  // Keep a ref to noteId so the onUpdate closure always has the latest
  const noteIdRef = useRef(noteId);
  useEffect(() => {
    noteIdRef.current = noteId;
  }, [noteId]);

  // Load a note into the editor
  const loadNote = useCallback(
    async (id: number) => {
      if (!editor) return;
      // Flush pending save for current note
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        const currentId = noteIdRef.current;
        if (currentId != null) {
          await updateNote(currentId, { content: editor.getJSON() });
        }
      }
      const note = await getNote(id);
      if (note) {
        editor.commands.setContent(note.content);
        setNoteId(id);
        localStorage.setItem(LAST_NOTE_KEY, String(id));
      }
    },
    [editor]
  );

  // Initialize: migrate, then load last note or create first note
  useEffect(() => {
    if (!editor) return;
    let cancelled = false;

    (async () => {
      await migrateIfNeeded();

      // Check for deep link in URL hash
      const hashNoteId = parseNoteHash(window.location.hash);
      if (hashNoteId) {
        const note = await getNote(hashNoteId);
        if (note && !cancelled) {
          editor.commands.setContent(note.content);
          setNoteId(note.id);
          localStorage.setItem(LAST_NOTE_KEY, String(note.id));
          history.replaceState(null, "", window.location.pathname);
          setReady(true);
          return;
        }
      }

      const lastId = localStorage.getItem(LAST_NOTE_KEY);
      if (lastId) {
        const note = await getNote(Number(lastId));
        if (note && !cancelled) {
          editor.commands.setContent(note.content);
          setNoteId(note.id);
          setReady(true);
          return;
        }
      }

      // No last note — get first note or create one
      const first = await db.notes.orderBy("modified").reverse().first();
      if (first && !cancelled) {
        editor.commands.setContent(first.content);
        setNoteId(first.id);
        localStorage.setItem(LAST_NOTE_KEY, String(first.id));
      } else if (!cancelled) {
        const id = await createNote();
        const note = await getNote(id);
        if (note) {
          editor.commands.setContent(note.content);
          setNoteId(id);
          localStorage.setItem(LAST_NOTE_KEY, String(id));
        }
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [editor]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K — command palette
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      // ⌘[ — back
      if (e.metaKey && e.key === "[") {
        e.preventDefault();
        if (noteId != null) {
          const prev = goBack(noteId);
          if (prev != null) loadNote(prev);
        }
        return;
      }
      // ⌘] — forward
      if (e.metaKey && e.key === "]") {
        e.preventDefault();
        if (noteId != null) {
          const next = goForward(noteId);
          if (next != null) loadNote(next);
        }
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [noteId, loadNote]);

  const handleSelectNote = useCallback(
    (id: number) => {
      if (noteId != null && id !== noteId) {
        pushHistory(noteId);
      }
      loadNote(id);
    },
    [noteId, loadNote]
  );

  useEffect(() => {
    handleSelectNoteRef.current = handleSelectNote;
  }, [handleSelectNote]);

  // Handle link clicks in the editor via DOM events
  useEffect(() => {
    if (!editor) return;
    const el = editor.view.dom;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const element =
        target.nodeType === Node.TEXT_NODE
          ? target.parentElement
          : (target as HTMLElement);
      const anchor = element?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      e.stopPropagation();
      const targetNoteId = isInternalNoteUrl(href);
      if (targetNoteId !== null) {
        handleSelectNoteRef.current?.(targetNoteId);
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    };
    el.addEventListener("click", onClick, true);
    return () => el.removeEventListener("click", onClick, true);
  }, [editor]);

  // Listen for hash changes (e.g. deep link pasted into address bar)
  useEffect(() => {
    const onHashChange = () => {
      const id = parseNoteHash(window.location.hash);
      if (id !== null) {
        handleSelectNote(id);
        history.replaceState(null, "", window.location.pathname);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [handleSelectNote]);

  const handleNewNote = useCallback(async () => {
    const id = await createNote();
    if (noteId != null) pushHistory(noteId);
    loadNote(id);
  }, [noteId, loadNote]);

  const handleDeleteNote = useCallback(
    async (id: number) => {
      await deleteNote(id);
      if (id === noteId) {
        // Load another note or create a new one
        const next = await db.notes.orderBy("modified").reverse().first();
        if (next) {
          loadNote(next.id);
        } else {
          const newId = await createNote();
          loadNote(newId);
        }
      }
    },
    [noteId, loadNote]
  );

  const handleTogglePin = useCallback(async (id: number, pinned: boolean) => {
    await updateNote(id, { pinned });
  }, []);

  // --- Inline link input state ---
  const [linkInput, setLinkInput] = useState<{
    from: number;
    to: number;
    top: number;
    left: number;
  } | null>(null);

  const handleRequestLink = useCallback(
    (selection: { from: number; to: number }) => {
      if (!editor) return;
      const coords = editor.view.coordsAtPos(selection.from);
      setLinkInput({
        from: selection.from,
        to: selection.to,
        top: coords.bottom + 4,
        left: coords.left,
      });
    },
    [editor]
  );

  const handleLinkSubmit = useCallback(
    (url: string) => {
      if (!editor || !linkInput) return;
      editor
        .chain()
        .focus()
        .setTextSelection({ from: linkInput.from, to: linkInput.to })
        .setLink({ href: url })
        .run();
      setLinkInput(null);
    },
    [editor, linkInput]
  );

  const handleLinkCancel = useCallback(() => {
    setLinkInput(null);
    editor?.commands.focus();
  }, [editor]);

  if (!ready) return null;

  return (
    <>
      {editor && (
        <Toolbar editor={editor} onRequestLink={handleRequestLink} />
      )}
      <EditorContent editor={editor} />
      {linkInput && (
        <LinkInput
          top={linkInput.top}
          left={linkInput.left}
          onSubmit={handleLinkSubmit}
          onCancel={handleLinkCancel}
        />
      )}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        onDeleteNote={handleDeleteNote}
        onTogglePin={handleTogglePin}
        currentNoteId={noteId}
      />
    </>
  );
}
