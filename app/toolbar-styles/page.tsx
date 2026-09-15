'use client';

import React, { useState } from 'react';
import { Columns3, Filter, Plus, RotateCw, Save, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

type StyleId = 'current' | 'pill';

const STYLES: { id: StyleId; name: string; hint: string }[] = [
  { id: 'current', name: 'Current', hint: 'Rounded rectangles, matching the cards and inputs around them' },
  { id: 'pill', name: 'Pill', hint: 'Fully rounded track, chips and primary, with a softer shadow' },
];

const TOOLS = [
  { id: 'reload', label: 'Reload', icon: RotateCw },
  { id: 'filter', label: 'Filter', icon: Filter },
  { id: 'columns', label: 'Columns', icon: Columns3 },
  { id: 'export', label: 'Export', icon: Upload },
];

/** One toolbar, drawn in whichever button style is selected */
function Toolbar({ style, active, onPick }: { style: StyleId; active: string; onPick: (id: string) => void }) {
  const isPill = style === 'pill';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className={cn(
          'inline-flex h-11 items-center gap-1 border border-slate-200 bg-white p-1',
          isPill ? 'rounded-full' : 'rounded-xl'
        )}
      >
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.id === active;
          return (
            <button
              key={tool.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onPick(tool.id)}
              className={cn(
                'inline-flex h-9 cursor-pointer items-center gap-2 px-3.5 text-[13px] font-semibold transition',
                isPill ? 'rounded-full' : 'rounded-lg',
                isActive
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-slate-400')} />
              {tool.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={cn(
          'inline-flex h-11 cursor-pointer items-center gap-2 bg-blue-500 text-[13px] font-bold text-white transition hover:bg-blue-600 active:scale-[0.98]',
          isPill
            ? 'rounded-full px-6 shadow-lg shadow-blue-500/30'
            : 'rounded-xl px-5 shadow-md shadow-blue-500/25'
        )}
      >
        <Plus className="h-4 w-4" />
        Add Individual
      </button>
    </div>
  );
}

/** Scratch page: the toolbar in the current style vs the pill style from the Submit button. */
export default function ToolbarStylesPage() {
  const [style, setStyle] = useState<StyleId>('current');
  const [active, setActive] = useState('filter');

  const activeStyle = STYLES.find((item) => item.id === style) ?? STYLES[0];

  return (
    <main className="min-h-screen bg-[#eef2f7] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-[15px] font-black tracking-tight text-slate-900">Toolbar button style</h1>
        <p className="mt-1.5 text-[11.5px] text-slate-500">
          Switch between the current rounded rectangles and the pill shape from the Submit button.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {STYLES.map((item) => {
              const isOn = item.id === style;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => setStyle(item.id)}
                  className={cn(
                    'cursor-pointer rounded-xl px-4 py-2 text-[12px] font-bold transition',
                    isOn ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
          <p className="text-[11.5px] text-slate-500">{activeStyle.hint}</p>
        </div>

        {/* The toolbar in the chosen style, on the surface it really sits on */}
        <div className="mt-6 rounded-[20px] border border-slate-200/60 bg-white p-5 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)] sm:p-6">
          <Toolbar style={style} active={active} onPick={setActive} />

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Form footer</span>
            <button
              type="button"
              className={cn(
                'inline-flex h-10 cursor-pointer items-center gap-2 border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50',
                style === 'pill' ? 'rounded-full' : 'rounded-lg'
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              className={cn(
                'inline-flex h-10 cursor-pointer items-center gap-2 bg-blue-500 text-xs font-bold text-white transition hover:bg-blue-600 active:scale-[0.98]',
                style === 'pill'
                  ? 'rounded-full px-6 shadow-lg shadow-blue-500/30'
                  : 'rounded-lg px-5 shadow-md shadow-blue-500/25'
              )}
            >
              <Save className="h-4 w-4" />
              Submit
            </button>
          </div>
        </div>

        {/* Inputs and cards stay rounded either way, to show the pairing */}
        <div className="mt-4 rounded-[20px] border border-slate-200/60 bg-white p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Beside an input</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="SEARCH RECORDS"
              className="h-11 w-64 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
            <button
              type="button"
              className={cn(
                'inline-flex h-11 cursor-pointer items-center gap-2 bg-blue-500 text-[13px] font-bold text-white transition hover:bg-blue-600',
                style === 'pill'
                  ? 'rounded-full px-6 shadow-lg shadow-blue-500/30'
                  : 'rounded-xl px-5 shadow-md shadow-blue-500/25'
              )}
            >
              <Plus className="h-4 w-4" />
              Add Record
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
