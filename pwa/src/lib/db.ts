import Dexie, { type EntityTable } from "dexie";

export interface Note {
  id: number;
  content: object; // Tiptap JSON
  created: Date;
  modified: Date;
  pinned: boolean;
}

const db = new Dexie("FloatyNotey") as Dexie & {
  notes: EntityTable<Note, "id">;
};

db.version(1).stores({
  notes: "++id, modified, pinned",
});

export { db };
