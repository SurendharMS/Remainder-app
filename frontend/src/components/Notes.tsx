import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Copy, Trash2, Check, FileText, Sparkles, Save, Clock, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'color', 'background',
];

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<string>('');
  
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);

  useEffect(() => {
    const storedNotes = localStorage.getItem('app_notes_library');
    if (storedNotes) {
      try {
        const parsed = JSON.parse(storedNotes);
        setNotes(parsed);
      } catch (e) {
        console.error('Failed to parse notes');
      }
    } else {
      const oldNote = localStorage.getItem('app_general_notes');
      const oldSavedAt = localStorage.getItem('app_general_notes_saved_at');
      if (oldNote) {
        const migratedNote: Note = {
          id: Date.now().toString(),
          title: 'General Notes',
          content: oldNote,
          updatedAt: oldSavedAt || new Date().toISOString()
        };
        setNotes([migratedNote]);
        localStorage.setItem('app_notes_library', JSON.stringify([migratedNote]));
      }
    }
  }, []);

  const handleNewNote = () => {
    setActiveNoteId(null);
    setTitle('');
    setContent('');
    setIsDirty(false);
  };

  const loadNote = (note: Note) => {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsDirty(false);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleSaveNote = () => {
    const now = new Date().toISOString();
    let updatedNotes = [...notes];
    
    if (activeNoteId) {
      updatedNotes = updatedNotes.map(n => 
        n.id === activeNoteId ? { ...n, title: title || 'Untitled Note', content, updatedAt: now } : n
      );
    } else {
      const newNote = {
        id: Date.now().toString(),
        title: title || 'Untitled Note',
        content,
        updatedAt: now
      };
      updatedNotes.unshift(newNote);
      setActiveNoteId(newNote.id);
    }
    
    setNotes(updatedNotes);
    localStorage.setItem('app_notes_library', JSON.stringify(updatedNotes));
    setIsDirty(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem('app_notes_library', JSON.stringify(updatedNotes));
      if (activeNoteId === id) {
        handleNewNote();
      }
    }
  };

  const handleCopy = async () => {
    try {
      const tempEl = document.createElement('div');
      tempEl.innerHTML = content;
      const plainText = tempEl.innerText || tempEl.textContent || '';
      await navigator.clipboard.writeText(plainText);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    } catch {
      // Fallback
    }
  };

  const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (tempDiv) {
    tempDiv.innerHTML = content;
  }
  const plainText = tempDiv ? (tempDiv.innerText || tempDiv.textContent || '').trim() : '';
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = plainText.length;

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0 overflow-hidden">
      <style>{`
        .rich-notes-editor .quill {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .rich-notes-editor .ql-toolbar {
          background-color: transparent;
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 1rem 0;
          margin-bottom: 0.5rem;
          flex-shrink: 0;
        }
        .rich-notes-editor .ql-container {
          background-color: transparent;
          border: none !important;
          font-family: inherit;
          font-size: 1.05rem;
          flex: 1;
          height: 100%;
          min-height: 0;
          color: #1e293b;
          overflow-y: auto;
        }
        .rich-notes-editor .ql-editor {
          min-height: 100%;
          line-height: 1.7;
          padding: 0 0 2rem 0;
        }
        .rich-notes-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
          left: 0;
        }
        .dark .rich-notes-editor .ql-toolbar {
          border-bottom-color: #334155 !important;
        }
        .dark .rich-notes-editor .ql-toolbar .ql-stroke {
          stroke: #cbd5e1;
        }
        .dark .rich-notes-editor .ql-toolbar .ql-fill {
          fill: #cbd5e1;
        }
        .dark .rich-notes-editor .ql-toolbar .ql-picker {
          color: #cbd5e1;
        }
        .dark .rich-notes-editor .ql-toolbar .ql-picker-options {
          background-color: #0f172a;
          border-color: #334155;
          color: #cbd5e1;
        }
        .dark .rich-notes-editor .ql-container {
          color: #f1f5f9;
        }
        .dark .rich-notes-editor .ql-editor.ql-blank::before {
          color: #64748b;
        }
      `}</style>

      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
          Notes Library
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
          Organize your thoughts, memos, and outlines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[60vh] min-h-[400px] max-h-[600px]">
        
        {/* Left Column: Notes List */}
        <div className="lg:col-span-1 bg-blue-50/50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
          {/* Pinned Add Note Button inside container */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/30">
            <button
              onClick={handleNewNote}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all duration-200 hover:brightness-110 active:scale-95 text-base"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Add Note
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {notes.length === 0 ? (
              <div className="text-center p-8 text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center h-full">
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No saved notes</p>
                <p className="text-xs mt-1">Click "Add Note" to start</p>
              </div>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => loadNote(note)}
                  className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${
                    activeNoteId === note.id 
                      ? 'bg-blue-100/60 dark:bg-blue-900/50 border-l-4 border-blue-500 dark:border-blue-400 shadow-sm' 
                      : 'hover:bg-white dark:hover:bg-slate-700/60 border-l-4 border-transparent hover:-translate-y-1 hover:shadow-sm'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`font-semibold text-base truncate ${activeNoteId === note.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {note.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {format(parseISO(note.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-3 bg-slate-50/50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
            <input
              type="text"
              placeholder="Note Title..."
              value={title}
              onChange={handleTitleChange}
              className="flex-1 bg-transparent text-3xl font-bold text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none w-full transition-all duration-200 focus:scale-[1.01]"
            />
            
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!plainText}
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 active:scale-95"
              >
                {copiedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveNote}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold tracking-wide rounded-lg shadow-sm transition-all duration-200 active:scale-95 ${
                  savedFeedback
                    ? 'bg-emerald-500 text-white'
                    : isDirty
                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/30 hover:brightness-110'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:brightness-110'
                }`}
              >
                {savedFeedback ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save {isDirty && '•'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rich-notes-editor flex-1 h-full overflow-y-auto custom-scrollbar pr-2 mt-4">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleContentChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Start writing..."
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-500 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-slate-700 dark:text-slate-300 font-medium">{wordCount}</strong> words
              </span>
              <span>•</span>
              <span>
                <strong className="text-slate-700 dark:text-slate-300 font-medium">{charCount}</strong> chars
              </span>
              {isDirty && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-medium">
              {activeNote ? (
                <>
                  <Clock className="w-4 h-4 text-blue-500 opacity-80" />
                  <span>Last saved {format(parseISO(activeNote.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-400 opacity-80" />
                  <span>Not saved yet</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
