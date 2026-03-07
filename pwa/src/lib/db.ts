import Dexie, { type EntityTable } from "dexie";

export interface Note {
  id: number;
  content: object; // Tiptap JSON
  created: Date;
  modified: Date;
  pinned: boolean;
  remoteId: string | null;
  syncedAt: string | null; // ISO 8601
  deleted: boolean;
}

const db = new Dexie("FloatyNotey") as Dexie & {
  notes: EntityTable<Note, "id">;
};

db.version(1).stores({
  notes: "++id, modified, pinned",
});

db.version(2)
  .stores({
    notes: "++id, modified, pinned, remoteId",
  })
  .upgrade((tx) =>
    tx
      .table("notes")
      .toCollection()
      .modify((note) => {
        note.remoteId = null;
        note.syncedAt = null;
        note.deleted = false;
      })
  );

export { db };
