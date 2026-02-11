"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlock from "@tiptap/extension-code-block";
import { db } from "@/lib/db";
import { createNote, getNote, updateNote, deleteNote } from "@/lib/notes";
import { migrateIfNeeded } from "@/lib/migrate";
import { pushHistory, goBack, goForward } from "@/lib/history";
import CommandPalette from "./command-palette";
import Toolbar from "./toolbar";

const LAST_NOTE_KEY = "floatynotey:lastNote";
const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

export default function Editor() {
  const [ready, setReady] = useState(false);
  const [noteId, setNoteId] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlock,
      TaskList,
      TaskItem.configure({ nested: true }),
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

  if (!ready) return null;

  return (
    <>
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
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
