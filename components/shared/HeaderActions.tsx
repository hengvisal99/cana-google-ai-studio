'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { DesignTheme, SupportedLanguage, EnterpriseApp } from '@/types';
import { LayoutGrid, Globe, Sun, Moon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type MenuKey = 'app' | 'lang' | 'appearance' | 'user';

interface HeaderActionsProps {
  /** Active design system — drives this cluster's visual skin */
  currentTheme: DesignTheme;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  currentApp: EnterpriseApp;
  onAppChange: (app: EnterpriseApp) => void;
}

const APPS: EnterpriseApp[] = [
  'Nexus Core Banking',
  'Nexus Wealth & Asset',
  'Risk & AML Gateway',
  'Corporate Treasury 360',
];

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'EN', label: 'English (US)', flag: '🇺🇸' },
  { code: 'ES', label: 'Español (ES)', flag: '🇪🇸' },
  { code: 'FR', label: 'Français (FR)', flag: '🇫🇷' },
  { code: 'DE', label: 'Deutsch (DE)', flag: '🇩🇪' },
  { code: 'JA', label: '日本語 (JP)', flag: '🇯🇵' },
];

/** Appearance modes. Dark is listed as a label only — the app ships light mode. */
const APPEARANCES: { id: 'light' | 'dark'; label: string; icon: React.ReactNode; available: boolean }[] = [
  { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" />, available: true },
  { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" />, available: false },
];

const USER = {
  name: 'Marcus Aurelius',
  role: 'Chief Risk Officer',
  email: 'm.aurelius@nexusbank.com',
  clearance: 'Level 4 Officer',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
};

/** Per-theme visual tokens so one header behaves identically across all three design systems */
const SKIN: Record<
  DesignTheme,
  {
    iconBtn: string;
    iconBtnOpen: string;
    profileBtn: string;
    profileBtnOpen: string;
    panel: string;
    item: string;
    itemActive: string;
    itemIdle: string;
    checkActive: string;
    badge: string;
    avatarRing: string;
    divider: string;
  }
> = {
  'soft-fintech': {
    iconBtn: 'rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900',
    iconBtnOpen: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    profileBtn: 'rounded-lg bg-slate-100 hover:bg-slate-200/80',
    profileBtnOpen: 'bg-blue-50 ring-1 ring-blue-200',
    panel: 'bg-white border border-slate-200 rounded-xl shadow-xl',
    item: 'rounded-lg',
    itemActive: 'bg-blue-50 text-blue-700 font-bold',
    itemIdle: 'text-slate-700 hover:bg-slate-50',
    checkActive: 'text-blue-600',
    badge: 'bg-blue-600 text-white',
    avatarRing: 'border border-slate-300',
    divider: 'border-slate-100',
  },
  glassmorphism: {
    iconBtn:
      'rounded-full bg-white/70 border border-white/80 text-slate-600 shadow-xs hover:bg-white hover:text-slate-900',
    iconBtnOpen: 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30',
    profileBtn: 'rounded-full bg-white/70 border border-white/80 shadow-xs hover:bg-white',
    profileBtnOpen: 'bg-white ring-2 ring-blue-500/20',
    panel:
      'bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-2xl shadow-slate-400/20',
    item: 'rounded-xl',
    itemActive: 'bg-blue-500 text-white font-bold',
    itemIdle: 'text-slate-700 hover:bg-slate-100',
    checkActive: 'text-white',
    badge: 'bg-blue-500 text-white',
    avatarRing: 'ring-2 ring-blue-500/20',
    divider: 'border-slate-100',
  },
  aurora: {
    iconBtn: 'rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900',
    iconBtnOpen:
      'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25',
    profileBtn: 'rounded-xl bg-slate-100 hover:bg-slate-200/80',
    profileBtnOpen: 'bg-blue-50 ring-1 ring-blue-200',
    panel: 'bg-white border border-slate-200 rounded-2xl shadow-2xl',
    item: 'rounded-xl',
    itemActive: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold',
    itemIdle: 'text-slate-700 hover:bg-slate-100',
    checkActive: 'text-white',
    badge: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    avatarRing: 'ring-2 ring-blue-500',
    divider: 'border-slate-100',
  },
};

/**
 * Header action cluster: switch application, language and theme as icon buttons,
 * followed by the profile chip showing the signed-in name.
 */
export function HeaderActions({
  currentTheme,
  currentLanguage,
  onLanguageChange,
  currentApp,
  onAppChange,
}: HeaderActionsProps) {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const skin = SKIN[currentTheme];

  // Close on outside click / Escape so the icon menus never stay stacked open
  useEffect(() => {
    if (!openMenu) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenu]);

  const toggle = (key: MenuKey) => setOpenMenu((prev) => (prev === key ? null : key));

  const iconButtonClass = (key: MenuKey) =>
    cn(
      'relative w-9 h-9 flex items-center justify-center shrink-0 transition-all duration-200',
      skin.iconBtn,
      openMenu === key && skin.iconBtnOpen
    );

  const itemClass = (isActive: boolean) =>
    cn(
      'w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-3 transition',
      skin.item,
      isActive ? skin.itemActive : skin.itemIdle
    );

  return (
    <div ref={containerRef} className="flex items-center gap-2 shrink-0">
      {/* Switch Application (icon) */}
      <div className="relative">
        <button
          id="header-action-app"
          type="button"
          onClick={() => toggle('app')}
          aria-haspopup="menu"
          aria-expanded={openMenu === 'app'}
          aria-label={`Switch application, current: ${currentApp}`}
          title={`Switch Application — ${currentApp}`}
          className={iconButtonClass('app')}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {openMenu === 'app' && (
          <div
            role="menu"
            className={cn(
              'absolute right-0 mt-2 w-60 p-2 z-50 animate-in fade-in zoom-in-95 duration-150',
              skin.panel
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
              Switch Application
            </span>
            {APPS.map((app) => (
              <button
                key={app}
                type="button"
                role="menuitem"
                onClick={() => {
                  onAppChange(app);
                  setOpenMenu(null);
                }}
                className={itemClass(currentApp === app)}
              >
                <span className="truncate">{app}</span>
                {currentApp === app && (
                  <Check className={cn('w-3.5 h-3.5 shrink-0', skin.checkActive)} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language (icon) */}
      <div className="relative">
        <button
          id="header-action-language"
          type="button"
          onClick={() => toggle('lang')}
          aria-haspopup="menu"
          aria-expanded={openMenu === 'lang'}
          aria-label={`Language, current: ${currentLanguage}`}
          title={`Language — ${currentLanguage}`}
          className={iconButtonClass('lang')}
        >
          <Globe className="w-4 h-4" />
          <span
            className={cn(
              'absolute -bottom-1 -right-1 px-1 py-px rounded-full text-[8px] font-bold leading-none tracking-wide',
              skin.badge
            )}
          >
            {currentLanguage}
          </span>
        </button>

        {openMenu === 'lang' && (
          <div
            role="menu"
            className={cn(
              'absolute right-0 mt-2 w-48 p-2 z-50 animate-in fade-in zoom-in-95 duration-150',
              skin.panel
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
              Language
            </span>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                role="menuitem"
                onClick={() => {
                  onLanguageChange(l.code);
                  setOpenMenu(null);
                }}
                className={itemClass(currentLanguage === l.code)}
              >
                <span className="flex items-center gap-2 truncate">
                  <span>{l.flag}</span>
                  <span className="truncate">{l.label}</span>
                </span>
                {currentLanguage === l.code && (
                  <Check className={cn('w-3.5 h-3.5 shrink-0', skin.checkActive)} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Appearance: light mode only, dark shown as a label */}
      <div className="relative">
        <button
          id="header-action-appearance"
          type="button"
          onClick={() => toggle('appearance')}
          aria-haspopup="menu"
          aria-expanded={openMenu === 'appearance'}
          aria-label="Appearance, current: Light"
          title="Appearance — Light"
          className={iconButtonClass('appearance')}
        >
          <Sun className="w-4 h-4" />
        </button>

        {openMenu === 'appearance' && (
          <div
            role="menu"
            className={cn(
              'absolute right-0 mt-2 w-48 p-2 z-50 animate-in fade-in zoom-in-95 duration-150',
              skin.panel
            )}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
              Appearance
            </span>
            {APPEARANCES.map((mode) =>
              mode.available ? (
                <button
                  key={mode.id}
                  type="button"
                  role="menuitem"
                  onClick={() => setOpenMenu(null)}
                  className={itemClass(true)}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={cn('shrink-0', skin.checkActive)}>{mode.icon}</span>
                    <span>{mode.label}</span>
                  </span>
                  <Check className={cn('w-3.5 h-3.5 shrink-0', skin.checkActive)} />
                </button>
              ) : (
                <div
                  key={mode.id}
                  role="menuitem"
                  aria-disabled="true"
                  className={cn(
                    'w-full px-3 py-2 text-xs flex items-center justify-between gap-3 text-slate-400 cursor-not-allowed',
                    skin.item
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="shrink-0">{mode.icon}</span>
                    <span>{mode.label}</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">
                    Soon
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Profile with name */}
      <div className="relative ml-0.5">
        <button
          id="header-action-profile"
          type="button"
          onClick={() => toggle('user')}
          aria-haspopup="menu"
          aria-expanded={openMenu === 'user'}
          aria-label={`Profile, ${USER.name}`}
          title={USER.name}
          className={cn(
            'flex items-center gap-2.5 p-1 pr-3 transition-all duration-200',
            skin.profileBtn,
            openMenu === 'user' && skin.profileBtnOpen
          )}
        >
          <Image
            src={USER.avatar}
            alt=""
            width={28}
            height={28}
            className={cn('w-7 h-7 rounded-full object-cover shrink-0', skin.avatarRing)}
            referrerPolicy="no-referrer"
            unoptimized
          />
          <span className="hidden sm:block text-left leading-tight">
            <span className="block text-xs font-bold text-slate-900">{USER.name}</span>
            <span className="block text-[10px] text-blue-600 font-semibold">{USER.role}</span>
          </span>
        </button>

        {openMenu === 'user' && (
          <div
            role="menu"
            className={cn(
              'absolute right-0 mt-2 w-64 p-4 z-50 animate-in fade-in zoom-in-95 duration-150',
              skin.panel
            )}
          >
            <div className={cn('flex items-center gap-3 pb-3 border-b', skin.divider)}>
              <Image
                src={USER.avatar}
                alt=""
                width={44}
                height={44}
                className={cn('w-11 h-11 rounded-full object-cover shrink-0', skin.avatarRing)}
                referrerPolicy="no-referrer"
                unoptimized
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{USER.name}</h4>
                <span className="text-[11px] text-blue-600 font-semibold block truncate">
                  {USER.role}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">{USER.email}</span>
              </div>
            </div>
            <div className="pt-2.5 text-[11px] space-y-1">
              <div className="flex justify-between gap-3 text-slate-500">
                <span>Clearance</span>
                <strong className="text-slate-800">{USER.clearance}</strong>
              </div>
              <div className="flex justify-between gap-3 text-slate-500 min-w-0">
                <span className="shrink-0">Application</span>
                <strong className="text-slate-800 truncate">{currentApp}</strong>
              </div>
              <div className="flex justify-between gap-3 text-slate-500">
                <span>Session</span>
                <strong className="text-emerald-600">● Active</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
