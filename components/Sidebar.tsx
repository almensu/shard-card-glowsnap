
import React, { useState, useRef } from 'react';
import { AppSettings, SavedTheme } from '../types';
import {
  Sliders, Palette, Terminal, Copy, Check, Share2,
  Code, Zap, Heart, Trash2, FileJson, Plus,
  Download, Upload, FileDown, Image as ImageIcon, Type
} from 'lucide-react';

interface SidebarProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  savedThemes: SavedTheme[];
  setSavedThemes: React.Dispatch<React.SetStateAction<SavedTheme[]>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, savedThemes, setSavedThemes }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof AppSettings, val: any) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleHexInput = (key: 'gradientStart' | 'gradientEnd' | 'gradientColorC', val: string) => {
    let hex = val;
    if (hex && !hex.startsWith('#')) hex = '#' + hex;
    if (/^#?[0-9A-Fa-f]{0,6}$/.test(hex)) update(key, hex);
  };

  const getCLICommand = (s: Partial<AppSettings> = settings) => {
    let cmd = `config --p ${s.padding} --r ${s.borderRadius} --f ${s.fontSize} --a ${s.gradientAngle} --s ${s.gradientStart} --e ${s.gradientEnd}`;
    if (s.useColorC) {
      cmd += ` --c ${s.gradientColorC} --cr ${s.colorCRange} --cx ${s.colorCPosition?.x} --cy ${s.colorCPosition?.y}`;
    }
    return cmd;
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const saveCurrentTheme = () => {
    if (!newThemeName.trim()) return;
    const { content, ...themeSettings } = settings;
    const newTheme: SavedTheme = {
      id: Date.now().toString(),
      name: newThemeName.trim(),
      settings: themeSettings
    };
    setSavedThemes(prev => [newTheme, ...prev]);
    setNewThemeName('');
  };

  const deleteTheme = (id: string) => {
    setSavedThemes(prev => prev.filter(t => t.id !== id));
  };

  const applyTheme = (theme: SavedTheme) => {
    setSettings(prev => ({ ...prev, ...theme.settings }));
  };

  const downloadThemeFile = (theme: SavedTheme) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glowsnap-theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (json && json.name && json.settings) {
          const newTheme: SavedTheme = {
            ...json,
            id: Date.now().toString() // Ensure unique ID
          };
          setSavedThemes(prev => [newTheme, ...prev]);
        } else {
          alert("Invalid theme file format.");
        }
      } catch (err) {
        alert("Error parsing JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      update('imageData', dataUrl);
      update('mode', 'image');
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const handleModeChange = (mode: 'markdown' | 'image') => {
    update('mode', mode);
  };

  const clearImage = () => {
    update('imageData', undefined);
  };

  return (
    <div className="space-y-8 text-slate-300 pb-10">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Mode Selection Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Mode</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('markdown')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              settings.mode === 'markdown'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Type className="w-4 h-4" />
            Markdown
          </button>
          <button
            onClick={() => handleModeChange('image')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              settings.mode === 'image'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </button>
        </div>
      </section>

      {/* Image Upload Section - Only show in image mode */}
      {settings.mode === 'image' && (
        <section className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Image</h2>
            </div>
            {settings.imageData && (
              <button
                onClick={clearImage}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-full py-8 px-4 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-all flex flex-col items-center gap-2"
          >
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm">{settings.imageData ? 'Change Image' : 'Upload Image'}</span>
            <span className="text-xs opacity-50">PNG, JPG, GIF, WebP</span>
          </button>
          {settings.imageData && (
            <div className="mt-2 rounded-lg overflow-hidden border border-slate-700">
              <img
                src={settings.imageData}
                alt="Preview"
                className="w-full h-auto max-h-32 object-contain bg-slate-900"
              />
            </div>
          )}
        </section>
      )}

      {/* Content Section - Only show in markdown mode */}
      {settings.mode === 'markdown' && (
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Content</h2>
        </div>
        <textarea
          value={settings.content}
          onChange={(e) => update('content', e.target.value)}
          placeholder="Enter Markdown or code here..."
          className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm mono focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
        />
      </section>
      )}

      {/* Layout Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Layout</h2>
        </div>
        
        <div>
          <label className="text-xs font-medium mb-1 block">Padding ({settings.padding}px)</label>
          <input 
            type="range" min="20" max="120" step="4"
            value={settings.padding}
            onChange={(e) => update('padding', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Border Radius ({settings.borderRadius}px)</label>
            <input 
              type="range" min="0" max="40"
              value={settings.borderRadius}
              onChange={(e) => update('borderRadius', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Font Size ({settings.fontSize}px)</label>
            <input 
              type="range" min="12" max="24"
              value={settings.fontSize}
              onChange={(e) => update('fontSize', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Background Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Background</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Color A</label>
            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
              <input 
                type="color" value={settings.gradientStart}
                onChange={(e) => update('gradientStart', e.target.value)}
                className="w-6 h-6 bg-transparent rounded cursor-pointer p-0"
              />
              <input 
                type="text" value={settings.gradientStart.replace('#', '')}
                onChange={(e) => handleHexInput('gradientStart', e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs mono uppercase text-slate-300"
                maxLength={6}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Color B</label>
            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
              <input 
                type="color" value={settings.gradientEnd}
                onChange={(e) => update('gradientEnd', e.target.value)}
                className="w-6 h-6 bg-transparent rounded cursor-pointer p-0"
              />
              <input 
                type="text" value={settings.gradientEnd.replace('#', '')}
                onChange={(e) => handleHexInput('gradientEnd', e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs mono uppercase text-slate-300"
                maxLength={6}
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Accent Light (Color C)</span>
            <button 
              onClick={() => update('useColorC', !settings.useColorC)}
              className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${settings.useColorC ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'}`}
            >
              <div className="w-3 h-3 bg-white rounded-full" />
            </button>
          </div>
          {settings.useColorC && (
            <div className="space-y-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 animate-in fade-in slide-in-from-top-1">
               <div className="flex items-center gap-2">
                  <input 
                    type="color" value={settings.gradientColorC}
                    onChange={(e) => update('gradientColorC', e.target.value)}
                    className="w-5 h-5 bg-transparent rounded-full cursor-pointer p-0 overflow-hidden"
                  />
                  <input 
                    type="text" value={settings.gradientColorC.replace('#', '')}
                    onChange={(e) => handleHexInput('gradientColorC', e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-xs mono uppercase text-slate-300"
                    maxLength={6}
                  />
               </div>
               <input 
                  type="range" min="10" max="100"
                  value={settings.colorCRange}
                  onChange={(e) => update('colorCRange', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>
          )}
        </div>
      </section>

      {/* Theme Management Section */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Saved Themes</h2>
          </div>
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-md transition-all"
            title="Import Theme JSON"
          >
            <Upload className="w-3 h-3" />
            Import
          </button>
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Theme name..." 
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
          />
          <button 
            onClick={saveCurrentTheme}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {savedThemes.map(theme => (
            <div key={theme.id} className="group flex items-center justify-between p-2 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:border-slate-600 transition-all">
              <button 
                onClick={() => applyTheme(theme)}
                className="flex-1 text-left text-xs font-medium truncate px-1"
              >
                {theme.name}
              </button>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => downloadThemeFile(theme)}
                  title="Download JSON File"
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleCopy(JSON.stringify(theme.settings), `json-${theme.id}`)}
                  title="Copy JSON to Clipboard"
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  {copiedType === `json-${theme.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileJson className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => handleCopy(getCLICommand(theme.settings), `cli-${theme.id}`)}
                  title="Copy CLI Command"
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  {copiedType === `cli-${theme.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => deleteTheme(theme.id)}
                  title="Delete Theme"
                  className="p-1.5 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {savedThemes.length === 0 && <p className="text-[10px] text-slate-500 italic text-center py-4">No themes saved yet.</p>}
        </div>
      </section>

      {/* CLI & Automation Section */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <Code className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">CLI & Automation</h2>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => handleCopy(getCLICommand(), 'cli-main')}
            className="w-full flex items-center justify-between py-2 px-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300"
          >
            <div className="flex items-center gap-2"><Terminal className="w-3.5 h-3.5" /><span>Copy Current CLI</span></div>
            {copiedType === 'cli-main' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 opacity-40" />}
          </button>
        </div>
      </section>
    </div>
  );
};
