'use client';

import React, { useState } from 'react';
import { DesignTheme } from '@/types';
import { Palette, Sparkles, Layers, Building2, Check, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSwitcherButtonProps {
  currentTheme: DesignTheme;
  onThemeChange: (theme: DesignTheme) => void;
}

export function ThemeSwitcherButton({ currentTheme, onThemeChange }: ThemeSwitcherButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const themes: { id: DesignTheme; name: string; subtitle: string; icon: React.ReactNode; previewBadge: string }[] = [
    {
      id: 'soft-fintech',
      name: 'Soft FinTech',
      subtitle: 'Structured banking precision, micro-borders & crisp data ribbons',
      icon: <Building2 className="w-4 h-4 text-blue-600" />,
      previewBadge: 'Solid Slate-50 • Enterprise Layout',
    },
    {
      id: 'glassmorphism',
      name: 'Glassmorphism',
      subtitle: 'Floating frosted islands, translucent capsules & soft shadows',
      icon: <Layers className="w-4 h-4 text-indigo-500" />,
      previewBadge: 'Mist Pearl • Floating Island Layout',
    },
    {
      id: 'aurora',
      name: 'Aurora / Gradient',
      subtitle: 'Dynamic tech studio, radiant gradient accents & command deck',
      icon: <Sparkles className="w-4 h-4 text-blue-500" />,
      previewBadge: 'Sky Pearl • Studio Asymmetric Layout',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          id="theme-switcher-popup"
          className="mb-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 p-4 transition-all duration-200 animate-in slide-in-from-bottom-3"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 tracking-tight">Active Design System</h4>
                <p className="text-[11px] text-slate-500">Distinct template & visual language</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          <div className="space-y-2">
            {themes.map((t) => {
              const isActive = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  id={`theme-btn-${t.id}`}
                  onClick={() => {
                    onThemeChange(t.id);
                  }}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all duration-150 flex items-start justify-between group',
                    isActive
                      ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/70'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={cn(
                      'p-1.5 rounded-lg mt-0.5 transition-colors',
                      isActive ? 'bg-white shadow-xs' : 'bg-slate-100 group-hover:bg-white'
                    )}>
                      {t.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          'text-xs font-semibold',
                          isActive ? 'text-blue-700' : 'text-slate-800'
                        )}>
                          {t.name}
                        </span>
                        {isActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold bg-blue-500 text-white uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {t.subtitle}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-medium text-slate-400">
                        {t.previewBadge}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Primary: <strong className="font-semibold text-blue-600">#3B82F6</strong></span>
            <span>Light Mode Only</span>
          </div>
        </div>
      )}

      {/* Floating fixed trigger button - Crisp Light Mode */}
      <button
        id="fixed-theme-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white text-slate-800 shadow-xl shadow-slate-900/10 hover:border-blue-400 hover:bg-blue-50/60 active:scale-95 transition-all duration-200 border border-slate-200"
        title="Switch Design System & Template"
      >
        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <Palette className="w-3.5 h-3.5" />
        </div>
        <div className="text-left flex flex-col">
          <span className="text-[10px] text-slate-400 group-hover:text-blue-600 uppercase font-semibold tracking-wider leading-none">
            Template Theme
          </span>
          <span className="text-xs font-semibold text-slate-800 capitalize leading-snug">
            {currentTheme === 'soft-fintech' ? 'Soft FinTech' : currentTheme === 'glassmorphism' ? 'Glassmorphism' : 'Aurora / Gradient'}
          </span>
        </div>
        <ChevronUp className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
    </div>
  );
}
