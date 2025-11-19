import { create } from 'zustand';
import type { Note, GraphData, Link } from '@core/entities';
import { noteRepository } from '@services/storage/IndexedDBNoteRepository';
import { LinkExtractor } from '@services/graph/LinkExtractor';

interface NoteState {
  notes: Note[];
  graphData: GraphData;
  isLoading: boolean;
  error: string | null;

  loadNotes: () => Promise<void>;
  addNote: (title: string, content: string) => Promise<void>;
  updateNote: (id: string, title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateGraphData: () => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  graphData: { nodes: [], links: [] },
  isLoading: false,
  error: null,

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await noteRepository.getAllNotes();
      set({ notes });
      get().updateGraphData();
    } catch (error) {
      set({ error: 'Failed to load notes' });
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  addNote: async (title: string, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await noteRepository.saveNote(newNote);
      const notes = [...get().notes, newNote];
      set({ notes });
      get().updateGraphData();
    } catch (error) {
      set({ error: 'Failed to save note' });
      console.error(error);
    }
  },

  updateNote: async (id: string, title: string, content: string) => {
    const notes = get().notes;
    const noteIndex = notes.findIndex((n) => n.id === id);
    if (noteIndex === -1) return;

    const updatedNote = {
      ...notes[noteIndex],
      title,
      content,
      updatedAt: new Date(),
    };

    try {
      await noteRepository.saveNote(updatedNote);
      const newNotes = [...notes];
      newNotes[noteIndex] = updatedNote;
      set({ notes: newNotes });
      get().updateGraphData();
    } catch (error) {
      set({ error: 'Failed to update note' });
      console.error(error);
    }
  },

  deleteNote: async (id: string) => {
    try {
      await noteRepository.deleteNote(id);
      const notes = get().notes.filter((n) => n.id !== id);
      set({ notes });
      get().updateGraphData();
    } catch (error) {
      set({ error: 'Failed to delete note' });
      console.error(error);
    }
  },

  // Helper to recalculate graph data
  updateGraphData: () => {
    const notes = get().notes;
    const links: Link[] = [];
    const titleToIdMap = new Map(notes.map((n) => [n.title.toLowerCase(), n.id]));

    notes.forEach((note) => {
      const linkedTitles = LinkExtractor.extract(note.content);
      linkedTitles.forEach((linkedTitle) => {
        const targetId = titleToIdMap.get(linkedTitle.toLowerCase());
        if (targetId && targetId !== note.id) {
          links.push({ source: note.id, target: targetId });
        }
      });
    });

    set({
      graphData: {
        nodes: notes,
        links,
      },
    });
  },
}));
