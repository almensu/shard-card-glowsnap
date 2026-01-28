
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, ChevronRight } from 'lucide-react';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (command: string) => string | null;
}

const COMMAND_HISTORY_KEY = 'glowsnap_command_history';

export const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose, onExecute }) => {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem(COMMAND_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setHistoryIndex(-1);
    } else {
      setInput('');
      setFeedback(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add to history
    const newHistory = [trimmedInput, ...history.filter(h => h !== trimmedInput)].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem(COMMAND_HISTORY_KEY, JSON.stringify(newHistory));

    const error = onExecute(trimmedInput);
    if (error) {
      setFeedback({ msg: error, type: 'error' });
    } else {
      setFeedback({ msg: 'Command executed', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < history.length) {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden scale-in-center animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="flex items-center p-4 border-b border-slate-800">
          <Terminal className="w-5 h-5 text-slate-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setInput(e.target.value);
              setFeedback(null);
            }}
            placeholder="Type a command (Up/Down for history)..."
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-600 font-medium"
          />
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-md text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        <div className="p-4 bg-slate-950/30">
          {feedback ? (
            <div className={`flex items-center gap-2 text-sm font-medium ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              <ChevronRight className="w-3 h-3" />
              {feedback.msg}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-500 italic">
              <ChevronRight className="w-3 h-3" />
              Press Enter to execute
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
