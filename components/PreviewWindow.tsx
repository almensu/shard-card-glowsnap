
import React, { forwardRef } from 'react';
import { AppSettings } from '../types';
import { Image } from 'lucide-react';

interface PreviewWindowProps {
  settings: AppSettings;
  onUpdatePosition?: (x: number, y: number) => void;
}

export const PreviewWindow = forwardRef<HTMLDivElement, PreviewWindowProps>(({ settings, onUpdatePosition }, ref) => {
  const getThemeStyles = () => {
    switch(settings.theme) {
      case 'light': return 'bg-white text-slate-800';
      case 'obsidian': return 'bg-[#0f0f0f] text-slate-100';
      default: return 'bg-black text-slate-100';
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!settings.useColorC || !onUpdatePosition) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onUpdatePosition(Math.round(x), Math.round(y));
  };

  const renderContent = (content: string) => {
    // Basic Markdown Simulation
    return content.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mb-4 mt-2 text-white/90">{line.replace('### ', '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mb-4 mt-2 text-white/95">{line.replace('## ', '')}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black mb-6 mt-4">{line.replace('# ', '')}</h1>;

      // Horizontal Rule
      if (line === '---') return <hr key={i} className="border-t border-white/10 my-6" />;

      // List Items
      if (line.startsWith('- ')) return <div key={i} className="flex gap-2 mb-2"><span className="text-blue-400">•</span> <span>{parseInline(line.replace('- ', ''))}</span></div>;

      // Checkboxes
      if (line.startsWith('[x] ')) return <div key={i} className="flex items-center gap-2 mb-2"><span className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-[10px]">✓</span> <span>{parseInline(line.replace('[x] ', ''))}</span></div>;
      if (line.startsWith('[ ] ')) return <div key={i} className="flex items-center gap-2 mb-2"><span className="w-4 h-4 border border-white/20 rounded"></span> <span>{parseInline(line.replace('[ ] ', ''))}</span></div>;

      // Code blocks (simple)
      if (line.startsWith('```')) return null; // Simple hide start/end

      // Empty
      if (line.trim() === '') return <div key={i} className="h-4" />;

      return <p key={i} className="mb-2 leading-relaxed opacity-90">{parseInline(line)}</p>;
    });
  };

  const parseInline = (text: string) => {
    // Very basic bold simulation
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const linearBg = `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientStart}, ${settings.gradientEnd})`;
  const radialBg = settings.useColorC
    ? `radial-gradient(circle at ${settings.colorCPosition.x}% ${settings.colorCPosition.y}%, ${settings.gradientColorC} 0%, transparent ${settings.colorCRange}%)`
    : '';

  // Image Mode: Direct gradient border on image, no inner card
  if (settings.mode === 'image') {
    return (
      <div
        ref={ref}
        onClick={handleBackgroundClick}
        className={`relative flex items-center justify-center transition-all duration-300 ease-out ${settings.useColorC ? 'cursor-crosshair' : ''}`}
        style={{
          padding: `${settings.padding}px`,
          background: settings.useColorC ? `${radialBg}, ${linearBg}` : linearBg,
          borderRadius: `${settings.borderRadius}px`,
          boxShadow: `0 20px 70px -10px rgba(0,0,0,0.5)`,
          minWidth: '400px',
          maxWidth: '800px',
        }}
      >
        {/* Glossy Overlay for "Glass" effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)`,
            borderRadius: `${settings.borderRadius}px`
          }}
        />

        {/* Image content directly in gradient container */}
        {settings.imageData ? (
          <img
            src={settings.imageData}
            alt="Uploaded content"
            className="max-w-full max-h-full object-contain relative z-10 rounded-lg"
            style={{ maxHeight: '600px' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/30 relative z-10 min-h-[300px]">
            <Image className="w-16 h-16 mb-4" />
            <p className="text-sm">No image uploaded</p>
          </div>
        )}
      </div>
    );
  }

  // Markdown Mode: Original card with window controls
  return (
    <div
      ref={ref}
      onClick={handleBackgroundClick}
      className={`relative flex items-center justify-center transition-all duration-300 ease-out ${settings.useColorC ? 'cursor-crosshair' : ''}`}
      style={{
        padding: `${settings.padding}px`,
        background: settings.useColorC ? `${radialBg}, ${linearBg}` : linearBg,
        borderRadius: `${settings.borderRadius}px`,
        boxShadow: `0 20px 70px -10px rgba(0,0,0,0.5)`
      }}
    >
      {/* Glossy Overlay for "Glass" effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)`,
          borderRadius: `${settings.borderRadius}px`
        }}
      />

      <div
        className={`relative overflow-hidden shadow-2xl transition-all duration-300 ${getThemeStyles()}`}
        style={{
          borderRadius: `${Math.max(0, settings.borderRadius - 4)}px`,
          minWidth: '400px',
          maxWidth: '800px',
          fontSize: `${settings.fontSize}px`
        }}
      >
        {/* Window Controls */}
        {settings.showWindowControls && (
          <div className="flex items-center gap-1.5 px-4 pt-4 pb-2 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
        )}

        {/* Content */}
        <div className="p-8 mono">
          {renderContent(settings.content)}
        </div>
      </div>
    </div>
  );
});
