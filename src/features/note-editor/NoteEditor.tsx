import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { useNoteStore } from '@store/useNoteStore';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Card } from '@components/ui/Card';
import { MentionTextarea } from '@components/ui/MentionTextarea';

interface NoteEditorProps {
  noteId?: string;
  onClose?: () => void;
  onMentionClick?: (noteTitle: string) => void;
  isPreview: boolean;
  onTogglePreview: () => void;
}

export function NoteEditor({ noteId, onClose, onMentionClick, isPreview, onTogglePreview }: NoteEditorProps) {
  const { notes, addNote, updateNote } = useNoteStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (noteId) {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      }
    } else {
      setTitle('');
      setContent('');
    }
  }, [noteId, notes]);

  const handleSave = async () => {
    if (!title.trim()) return;

    if (noteId) {
      await updateNote(noteId, title, content);
    } else {
      await addNote(title, content);
      setTitle('');
      setContent('');
    }
    onClose?.();
  };

  // Custom renderer for mentions
  const renderMentions = (text: string) => {
    const parts: React.ReactNode[] = [];
    const mentionRegex = /@([A-Za-z0-9](?:[A-Za-z0-9\s]*[A-Za-z0-9])?)/g;
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionText = match[1];
      const matchStart = match.index;

      // Add text before mention
      if (lastIndex < matchStart) {
        parts.push(text.substring(lastIndex, matchStart));
      }

      // Add clickable mention
      parts.push(
        <button
          key={`mention-${matchStart}`}
          onClick={() => onMentionClick?.(mentionText)}
          className="text-primary font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          @{mentionText}
        </button>
      );

      lastIndex = matchStart + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <Card className="flex flex-col h-full border-none shadow-none bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-lg font-bold border-none shadow-none focus-visible:ring-0 px-0"
        />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onTogglePreview}>
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isPreview ? (
          <div className="h-full overflow-auto p-4 prose prose-sm dark:prose-invert max-w-none">
            <Markdown
              components={{
                // Custom text renderer to handle mentions
                p: ({ children }) => {
                  const processChildren = (child: React.ReactNode): React.ReactNode => {
                    if (typeof child === 'string') {
                      return renderMentions(child);
                    }
                    return child;
                  };

                  return <p>{Array.isArray(children) ? children.map(processChildren) : processChildren(children)}</p>;
                },
              }}
            >
              {content}
            </Markdown>
          </div>
        ) : (
          <MentionTextarea
            value={content}
            onChange={setContent}
            placeholder="Start writing... Use @NoteName to link notes."
            className="h-full font-mono text-sm"
          />
        )}
      </div>
    </Card>
  );
}
