
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PreviewWindow } from './components/PreviewWindow';
import { CommandBar } from './components/CommandBar';
import { AppSettings, DEFAULT_SETTINGS, SavedTheme } from './types';
import { toPng } from 'html-to-image';
import { Download, Sparkles, Layout, Terminal as TerminalIcon, Sun, Moon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const THEMES_STORAGE_KEY = 'glowsnap_saved_themes';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isExporting, setIsExporting] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [previewBg, setPreviewBg] = useState<'dark' | 'light'>('dark');
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(() => {
    const saved = localStorage.getItem(THEMES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(savedThemes));
  }, [savedThemes]);

  const handleExport = useCallback(async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    
    try {
      // Buffer for high-quality rendering
      await new Promise(r => setTimeout(r, 600));

      const dataUrl = await toPng(previewRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
        }
      });

      if (!dataUrl || dataUrl === 'data:,') throw new Error('Empty result');

      const link = document.createElement('a');
      link.download = `glowsnap-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // If triggered by URL, we could optionally close the window here
      // if (new URLSearchParams(window.location.search).get('autoclose') === 'true') window.close();

    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  }, [previewRef]);

  const handleAISuggestion = useCallback(async () => {
    setIsAIThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a professional technical writer. Refine and beautify the following markdown content. Return ONLY refined markdown.\n\nContent: ${settings.content}`,
      });
      const text = response.text;
      if (text) setSettings(prev => ({ ...prev, content: text }));
    } catch (err) {
      console.error('AI refinement failed', err);
    } finally {
      setIsAIThinking(false);
    }
  }, [settings.content]);

  const executeCommand = useCallback((cmd: string): string | null => {
    const parts = cmd.trim().split(/\s+/);
    const action = parts[0].toLowerCase();

    try {
      if (action === 'help') return "Commands: config [--p val] [--r val] [--f val] [--a val] [--s hex] [--e hex] [--c hex] [--cr val] [--cx val] [--cy val], theme [dark|light|obsidian], ai, export, reset";
      if (action === 'reset') { setSettings(DEFAULT_SETTINGS); return null; }
      if (action === 'export') { handleExport(); return null; }
      if (action === 'ai') { handleAISuggestion(); return null; }
      
      if (action === 'config' || action === 'set') {
        const updates: Partial<AppSettings> = {};
        for (let i = 1; i < parts.length; i += 2) {
          const flag = parts[i];
          const val = parts[i + 1];
          if (!flag || !val) continue;
          switch (flag) {
            case '--p': updates.padding = parseInt(val); break;
            case '--r': updates.borderRadius = parseInt(val); break;
            case '--f': updates.fontSize = parseInt(val); break;
            case '--a': updates.gradientAngle = parseInt(val); break;
            case '--s': updates.gradientStart = val.startsWith('#') ? val : `#${val}`; break;
            case '--e': updates.gradientEnd = val.startsWith('#') ? val : `#${val}`; break;
            case '--c': updates.gradientColorC = val.startsWith('#') ? val : `#${val}`; updates.useColorC = true; break;
            case '--cr': updates.colorCRange = parseInt(val); break;
            case '--cx': 
              if (!updates.colorCPosition) updates.colorCPosition = { ...settings.colorCPosition };
              updates.colorCPosition.x = parseInt(val); 
              break;
            case '--cy': 
              if (!updates.colorCPosition) updates.colorCPosition = { ...settings.colorCPosition };
              updates.colorCPosition.y = parseInt(val); 
              break;
          }
        }
        setSettings(s => ({ ...s, ...updates }));
        return null;
      }
      return "Command not found.";
    } catch (e) { return "Execution Error."; }
  }, [handleExport, handleAISuggestion, settings.colorCPosition]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.toString() === '') return;

    const updates: Partial<AppSettings> = {};
    
    // Support both long and short (CLI style) parameter names
    const getParam = (long: string, short: string) => params.get(long) || params.get(short);

    if (params.has('content')) {
      try { 
        // Try decoding as Base64 first for script support
        updates.content = decodeURIComponent(escape(atob(params.get('content')!)));
      } catch (e) {
        updates.content = params.get('content')!;
      }
    }

    const p = getParam('padding', 'p'); if (p) updates.padding = parseInt(p);
    const r = getParam('radius', 'r'); if (r) updates.borderRadius = parseInt(r);
    const f = getParam('fontSize', 'f'); if (f) updates.fontSize = parseInt(f);
    const a = getParam('angle', 'a'); if (a) updates.gradientAngle = parseInt(a);
    const s = getParam('start', 's'); if (s) updates.gradientStart = s.startsWith('#') ? s : `#${s}`;
    const e = getParam('end', 'e'); if (e) updates.gradientEnd = e.startsWith('#') ? e : `#${e}`;
    const c = getParam('colorc', 'c'); if (c) {
      updates.gradientColorC = c.startsWith('#') ? c : `#${c}`;
      updates.useColorC = true;
    }
    const cr = getParam('crange', 'cr'); if (cr) updates.colorCRange = parseInt(cr);
    const cx = getParam('cx', 'cx');
    const cy = getParam('cy', 'cy');
    if (cx || cy) {
      updates.colorCPosition = {
        x: parseInt(cx || '50'),
        y: parseInt(cy || '50')
      };
    }

    if (Object.keys(updates).length > 0) {
      setSettings(prev => ({ ...prev, ...updates }));
    }

    if (params.get('export') === 'true') {
      handleExport();
    }
  }, [handleExport]);

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-950">
      <CommandBar 
        isOpen={isCommandBarOpen} 
        onClose={() => setIsCommandBarOpen(false)}
        onExecute={executeCommand}
      />

      <div className="w-full lg:w-96 border-r border-slate-800 bg-slate-900/50 overflow-y-auto p-6 scrollbar-hide">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              GlowSnap
            </h1>
          </div>
          <button 
            onClick={() => setIsCommandBarOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <TerminalIcon className="w-5 h-5" />
          </button>
        </header>

        <Sidebar 
          settings={settings} 
          setSettings={setSettings} 
          savedThemes={savedThemes} 
          setSavedThemes={setSavedThemes}
        />

        <div className="mt-8 space-y-3">
          <button
            onClick={handleAISuggestion}
            disabled={isAIThinking}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-indigo-500/20"
          >
            <Sparkles className={`w-4 h-4 ${isAIThinking ? 'animate-spin' : ''}`} />
            {isAIThinking ? 'Refining...' : 'AI Refine Text'}
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating PNG...' : 'Download Image'}
          </button>
        </div>
      </div>

      <main className={`flex-1 relative overflow-auto p-4 lg:p-12 flex items-center justify-center transition-colors duration-500 ${previewBg === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {isExporting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Download className="w-6 h-6 text-emerald-500 animate-bounce" />
              </div>
            </div>
            <p className="mt-4 text-emerald-400 font-bold tracking-widest uppercase text-xs">Processing Retina Export</p>
          </div>
        )}

        <div className="absolute top-6 right-6 z-10 flex gap-2 p-1 bg-slate-800/20 backdrop-blur rounded-full border border-slate-700/30">
          <button onClick={() => setPreviewBg('dark')} className={`p-2 rounded-full transition-all ${previewBg === 'dark' ? 'bg-white text-slate-900' : 'text-slate-400'}`}><Moon className="w-4 h-4" /></button>
          <button onClick={() => setPreviewBg('light')} className={`p-2 rounded-full transition-all ${previewBg === 'light' ? 'bg-white text-slate-900' : 'text-slate-400'}`}><Sun className="w-4 h-4" /></button>
        </div>

        <PreviewWindow 
          ref={previewRef} 
          settings={settings} 
          onUpdatePosition={(x, y) => setSettings(s => ({ ...s, colorCPosition: { x, y } }))}
        />
      </main>
    </div>
  );
};

export default App;
