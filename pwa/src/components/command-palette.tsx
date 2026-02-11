"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { listNotes } from "@/lib/notes";
import { deriveTitle } from "@/lib/notes";
import type { Note } from "@/lib/db";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectNote: (id: number) => void;
  onNewNote: () => void;
  onDeleteNote: (id: number, title: string) => void;
  onTogglePin: (id: number, pinned: boolean) => void;
  currentNoteId: number | null;
}

export default function CommandPalette({
  open,
  onClose,
  onSelectNote,
  onNewNote,
  onDeleteNote,
  onTogglePin,
  currentNoteId,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const notes = useLiveQuery(() => listNotes(), []) ?? [];

  const filtered = query
    ? notes.filter((n) =>
        deriveTitle(n.content).toLowerCase().includes(query.toLowerCase())
      )
    : notes;

  // Items: notes + "New Note" action always at end
  type Item =
    | { kind: "note"; note: Note }
    | { kind: "new" };

  const items: Item[] = [
    ...filtered.map((note) => ({ kind: "note" as const, note })),
    { kind: "new" as const },
  ];

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setConfirmDelete(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Clamp selected index
  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, selectedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
          setConfirmDelete(null);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          setConfirmDelete(null);
          break;
        case "Enter": {
          e.preventDefault();
          const item = items[selectedIndex];
          if (!item) break;
          if (item.kind === "new") {
            onNewNote();
            onClose();
          } else {
            onSelectNote(item.note.id);
            onClose();
          }
          break;
        }
        case "Backspace": {
          // Delete on backspace when query is empty and a note is selected
          if (query === "") {
            const item = items[selectedIndex];
            if (item?.kind === "note") {
              if (confirmDelete === item.note.id) {
                onDeleteNote(item.note.id, deriveTitle(item.note.content));
                setConfirmDelete(null);
              } else {
                setConfirmDelete(item.note.id);
              }
              e.preventDefault();
            }
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          if (confirmDelete !== null) {
            setConfirmDelete(null);
          } else {
            onClose();
          }
          break;
      }
    },
    [items, selectedIndex, query, confirmDelete, onClose, onSelectNote, onNewNote, onDeleteNote]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
            setConfirmDelete(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search notes..."
          className="w-full rounded-t-lg border-b border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none dark:border-neutral-700"
        />
        <ul className="max-h-64 overflow-y-auto py-1">
          {items.map((item, i) => {
            const isSelected = i === selectedIndex;
            if (item.kind === "new") {
              return (
                <li
                  key="__new__"
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                  onMouseEnter={() => setSelectedIndex(i)}
                  onClick={() => {
                    onNewNote();
                    onClose();
                  }}
                >
                  <span>+</span>
                  <span>New Note</span>
                </li>
              );
            }

            const note = item.note;
            const title = deriveTitle(note.content);
            const isCurrent = note.id === currentNoteId;
            const isDeleting = confirmDelete === note.id;

            return (
              <li
                key={note.id}
                className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm ${
                  isSelected
                    ? isDeleting
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                    : ""
                }`}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => {
                  onSelectNote(note.id);
                  onClose();
                }}
              >
                <span className="flex items-center gap-2 truncate">
                  {note.pinned && <span className="text-xs">&#9733;</span>}
                  <span className="truncate">{title}</span>
                  {isCurrent && (
                    <span className="text-xs opacity-50">current</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  {isSelected && isDeleting && (
                    <span className="text-xs">Press Backspace again to delete</span>
                  )}
                  {isSelected && !isDeleting && (
                    <button
                      className="rounded px-1 text-xs opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(note.id, !note.pinned);
                      }}
                    >
                      {note.pinned ? "Unpin" : "Pin"}
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-neutral-200 px-4 py-2 text-xs text-neutral-400 dark:border-neutral-700">
          <span className="mr-3">↑↓ Navigate</span>
          <span className="mr-3">↵ Open</span>
          <span className="mr-3">⌫ Delete</span>
          <span>esc Close</span>
        </div>
      </div>
    </div>
  );
}
