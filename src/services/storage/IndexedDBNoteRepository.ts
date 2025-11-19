import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Note } from '@core/entities';
import type { NoteRepository } from '@core/repositories/NoteRepository';

interface NoteDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-title': string };
  };
}

export class IndexedDBNoteRepository implements NoteRepository {
  private dbPromise: Promise<IDBPDatabase<NoteDB>>;

  constructor() {
    this.dbPromise = openDB<NoteDB>('knowledge-graph-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('notes', {
          keyPath: 'id',
        });
        store.createIndex('by-title', 'title');
      },
    });
  }

  async getNote(id: string): Promise<Note | null> {
    const db = await this.dbPromise;
    const note = await db.get('notes', id);
    return note || null;
  }

  async getAllNotes(): Promise<Note[]> {
    const db = await this.dbPromise;
    return db.getAll('notes');
  }

  async saveNote(note: Note): Promise<void> {
    const db = await this.dbPromise;
    await db.put('notes', note);
  }

  async deleteNote(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('notes', id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    const db = await this.dbPromise;
    const allNotes = await db.getAll('notes');
    const lowerQuery = query.toLowerCase();

    return allNotes.filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
    );
  }
}

export const noteRepository = new IndexedDBNoteRepository();
