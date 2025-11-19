import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import { useNoteStore } from '@store/useNoteStore';
import type { Note } from '@core/entities';
import getCaretCoordinates from 'textarea-caret';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MentionTextarea({ value, onChange, placeholder, className = '' }: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [interactionMode, setInteractionMode] = useState<'keyboard' | 'mouse'>('keyboard');
  const { notes } = useNoteStore();

  // Filter notes based on mention query
  const filteredNotes = notes.filter(note => {
    if (!mentionQuery) return true; // Show all when @ is first pressed
    return note.title.toLowerCase().startsWith(mentionQuery.toLowerCase());
  });

  // Handle textarea change
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Check if we should show dropdown
    checkForMention(newValue, cursorPos);
  };

  // Check if @ was typed and should trigger dropdown
  const checkForMention = (text: string, cursorPos: number) => {
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    // No @ found
    if (lastAtIndex === -1) {
      setShowDropdown(false);
      return;
    }

    // Check if @ is at start or preceded by whitespace (not email)
    const charBeforeAt = textBeforeCursor[lastAtIndex - 1];
    const isValidMention = !charBeforeAt || charBeforeAt === ' ' || charBeforeAt === '\n';

    if (!isValidMention) {
      setShowDropdown(false);
      return;
    }

    // Extract query after @
    const query = textBeforeCursor.substring(lastAtIndex + 1);

    // Check if query contains space or newline (mention ended)
    if (query.includes(' ') || query.includes('\n')) {
      setShowDropdown(false);
      return;
    }

    // Calculate dropdown position
    if (textareaRef.current) {
      const coords = getCaretCoordinates(textareaRef.current, lastAtIndex + 1);
      const textareaRect = textareaRef.current.getBoundingClientRect();

      setDropdownPos({
        top: textareaRect.top + coords.top + coords.height + window.scrollY,
        left: textareaRect.left + coords.left + window.scrollX
      });
    }

    // Show dropdown immediately when @ is pressed
    setMentionQuery(query);
    setMentionStartPos(lastAtIndex);
    setSelectedIndex(0);
    setInteractionMode('keyboard'); // Reset to keyboard mode
    setShowDropdown(true);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setInteractionMode('keyboard'); // Switch to keyboard mode
        setSelectedIndex(prev =>
          prev < filteredNotes.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setInteractionMode('keyboard'); // Switch to keyboard mode
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;

      case 'Enter':
        if (filteredNotes.length > 0) {
          e.preventDefault();
          insertMention(filteredNotes[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  // Insert selected mention into textarea
  const insertMention = (note: Note) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const beforeMention = value.substring(0, mentionStartPos);
    const afterCursor = value.substring(textarea.selectionStart);

    // Insert @NoteName with a space after
    const newValue = `${beforeMention}@${note.title} ${afterCursor}`;
    onChange(newValue);

    // Close dropdown
    setShowDropdown(false);
    setMentionQuery('');

    // Move cursor after inserted mention
    const newCursorPos = mentionStartPos + note.title.length + 2; // +2 for @ and space
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mention-dropdown') && !target.closest('textarea')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  // Scroll selected item into view when using keyboard navigation
  useEffect(() => {
    if (interactionMode === 'keyboard' && showDropdown) {
      const selectedElement = document.querySelector(`[data-mention-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, interactionMode, showDropdown]);

  return (
    <div className="relative w-full h-full">
      {/* Normal textarea - text and cursor are both visible */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full h-full p-4 bg-background text-foreground resize-none focus:outline-none font-mono text-sm ${className}`}
      />

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div
          className="mention-dropdown fixed z-50 w-72 bg-popover border border-border rounded-md shadow-lg overflow-hidden"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
          }}
          onMouseMove={() => setInteractionMode('mouse')} // Switch to mouse mode on mouse movement
          onMouseLeave={() => setInteractionMode('keyboard')} // Back to keyboard mode when mouse leaves
        >
          {/* Note List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note, index) => (
                <button
                  key={note.id}
                  type="button"
                  data-mention-index={index} // Add data attribute for scrollIntoView
                  onClick={() => insertMention(note)}
                  onMouseEnter={() => {
                    setInteractionMode('mouse');
                    setSelectedIndex(index); // Update selectedIndex on hover
                  }}
                  className={`w-full text-left px-4 py-2 transition-colors ${
                    // Only show selection if in keyboard mode OR if this is the hovered item in mouse mode
                    (interactionMode === 'keyboard' && index === selectedIndex) ||
                    (interactionMode === 'mouse' && index === selectedIndex)
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <div className="font-medium">{note.title}</div>
                  {note.content && (
                    <div className="text-xs text-muted-foreground truncate">
                      {note.content.substring(0, 50)}...
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                No notes found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
