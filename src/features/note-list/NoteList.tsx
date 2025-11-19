import { useState, useEffect } from 'react';
import { useNoteStore } from '@store/useNoteStore';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Trash2, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteListProps {
  selectedNoteId?: string;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
}

export function NoteList({ selectedNoteId, onSelectNote, onNewNote }: NoteListProps) {
  const { notes, loadNotes, deleteNote } = useNoteStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full border-r bg-muted/10">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Notes</h2>
          <Button onClick={onNewNote} size="icon" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notes found.
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-accent transition-colors",
                  selectedNoteId === note.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
                onClick={() => onSelectNote(note.id)}
              >
                <div className="truncate font-medium text-sm">
                  {note.title || "Untitled Note"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
