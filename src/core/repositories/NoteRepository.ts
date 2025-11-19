import type { Note } from '../entities';

export interface NoteRepository {
  getNote(id: string): Promise<Note | null>;
  getAllNotes(): Promise<Note[]>;
  saveNote(note: Note): Promise<void>;
  deleteNote(id: string): Promise<void>;
  searchNotes(query: string): Promise<Note[]>;
}
