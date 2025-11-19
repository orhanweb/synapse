import { useState } from 'react';
import { MainLayout } from '@layouts/MainLayout';
import { NoteList } from '@features/note-list/NoteList';
import { NoteEditor } from '@features/note-editor/NoteEditor';
import { GraphView } from '@components/graph/GraphView';
import { Button } from '@components/ui/Button';
import { ModeToggle } from '@/components/mode-toggle';
import { Network } from 'lucide-react';
import { useNoteStore } from '@store/useNoteStore';

export function HomePage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(undefined);
  const [showGraph, setShowGraph] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const { notes } = useNoteStore();

  const handleNewNote = () => {
    setSelectedNoteId(undefined);
    setShowGraph(false);
  };

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setShowGraph(false);
  };

  const handleMentionClick = (noteTitle: string) => {
    // Find note by title
    const note = notes.find(n => n.title.toLowerCase() === noteTitle.toLowerCase());
    if (note) {
      setSelectedNoteId(note.id);
      setShowGraph(false);
    }
  };

  return (
    <MainLayout
      sidebar={
        <NoteList
          selectedNoteId={selectedNoteId}
          onSelectNote={handleSelectNote}
          onNewNote={handleNewNote}
        />
      }
    >
      <div className="h-full flex flex-col">
        <div className="h-12 border-b flex items-center justify-end px-4 bg-background gap-2">
          <ModeToggle />
          <Button
            variant={showGraph ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowGraph(!showGraph)}
            className="gap-2"
          >
            <Network className="h-4 w-4" />
            Graph View
          </Button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {showGraph ? (
            <GraphView onNodeClick={handleSelectNote} />
          ) : (
            <NoteEditor
              key={selectedNoteId || 'new'}
              noteId={selectedNoteId}
              onClose={() => setSelectedNoteId(undefined)}
              onMentionClick={handleMentionClick}
              isPreview={isPreview}
              onTogglePreview={() => setIsPreview(!isPreview)}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
