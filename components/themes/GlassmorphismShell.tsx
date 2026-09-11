'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { NavigationPage, DesignTheme, SupportedLanguage, EnterpriseApp } from '@/types';
import { 
  Sparkles, 
  LayoutDashboard, 
  Users, 
  User,
  Layers, 
  Globe, 
  Menu, 
  ChevronDown, 
  Check, 
  ShieldCheck, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShellProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  currentTheme: DesignTheme;
  onThemeChange: (theme: DesignTheme) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  currentApp: EnterpriseApp;
  onAppChange: (app: EnterpriseApp) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  children: React.ReactNode;
}

export function GlassmorphismShell({
  currentPage,
  onNavigate,
  currentTheme,
  onThemeChange,
  currentLanguage,
  onLanguageChange,
  currentApp,
  onAppChange,
  sidebarCollapsed,
  onToggleSidebar,
  children,
}: ShellProps) {
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const apps: EnterpriseApp[] = [
    'Nexus Core Banking',
    'Nexus Wealth & Asset',
    'Risk & AML Gateway',
    'Corporate Treasury 360',
  ];

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'EN', label: 'English (US)', flag: '🇺🇸' },
    { code: 'ES', label: 'Español (ES)', flag: '🇪🇸' },
    { code: 'FR', label: 'Français (FR)', flag: '🇫🇷' },
    { code: 'DE', label: 'Deutsch (DE)', flag: '🇩🇪' },
    { code: 'JA', label: '日本語 (JP)', flag: '🇯🇵' },
  ];

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Executive Overview';
      case 'customer-360':
        return 'Customer 360 Glass Deck';
      case 'individual-list':
        return 'Individual Directory (List)';
      case 'individual-insert':
        return 'Register Individual (Insert)';
      case 'individual-update':
        return 'Update Individual (Edit)';
    }
  };

  return (
    <div 
      id="glassmorphism-layout" 
      className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col antialiased relative selection:bg-blue-100"
    >
      <div className="flex flex-1 overflow-hidden p-3 sm:p-5 gap-5">
        {/* =========================================================================
            GLASSMORPHISM SIDEBAR: Floating Detached Island Dock
           ========================================================================= */}
        <aside
          id="glassmorphism-sidebar"
          aria-label="Glassmorphism Navigation Dock"
          className={cn(
            'bg-white/80 backdrop-blur-2xl border border-white/90 shadow-xl shadow-slate-300/40 rounded-3xl flex flex-col shrink-0 transition-all duration-300 z-30',
            sidebarCollapsed ? 'w-20 p-3 items-center' : 'w-64 p-5'
          )}
        >
          {/* Frosted Brand Capsule */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-200/60 w-full">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xs font-bold text-slate-900 tracking-tight">
                  GLASS 360
                </h1>
                <span className="text-[10px] text-blue-600 font-semibold block">
                  Floating Island System
                </span>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-5 space-y-6 overflow-y-auto w-full text-xs">
            <div>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
                  Island Modules
                </span>
              )}
              <div className="space-y-1.5">
                {/* Dashboard */}
                <button
                  id="glass-nav-dashboard"
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition-all duration-200',
                    currentPage === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  )}
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>

                {/* Customer 360 */}
                <button
                  id="glass-nav-customer-360"
                  type="button"
                  onClick={() => onNavigate('customer-360')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition-all duration-200',
                    currentPage === 'customer-360'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  )}
                  title="Customer 360"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Customer 360</span>}
                </button>

                {/* Individual */}
                <button
                  id="glass-nav-individual"
                  type="button"
                  onClick={() => onNavigate('individual-list')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition-all duration-200',
                    currentPage === 'individual-list' || currentPage === 'individual-insert' || currentPage === 'individual-update'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  )}
                  title="Individual (Directory)"
                >
                  <User className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Individual</span>}
                </button>
              </div>
            </div>
          </nav>

          {/* Frosted Bottom Island Pill */}
          {!sidebarCollapsed && (
            <div className="p-3 bg-white/60 rounded-2xl border border-white/80 text-[11px] text-slate-500">
              <span className="font-bold text-slate-800 block">Frosted Island Active</span>
              <span>Ultra-low blur overhead</span>
            </div>
          )}
        </aside>

        {/* Content Island Deck */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto space-y-5">
          {/* =========================================================================
              GLASSMORPHISM HEADER: Floating Translucent Pill Header
             ========================================================================= */}
          <header
            id="glassmorphism-header"
            className="bg-white/80 backdrop-blur-2xl border border-white/90 shadow-lg shadow-slate-300/30 rounded-2xl px-6 py-3.5 flex items-center justify-between gap-4 shrink-0"
          >
            {/* Left: Sidebar Toggle */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                id="glass-sidebar-toggle"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 shadow-xs transition"
                title="Toggle Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Switch Application + Language + User Profile */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Switch Application */}
              <div className="relative">
                <button
                  id="glass-header-app-switch"
                  onClick={() => {
                    setShowAppMenu(!showAppMenu);
                    setShowLangMenu(false);
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white/70 hover:bg-white rounded-full text-slate-700 shadow-xs border border-white/80 transition"
                  title="Switch Application"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline truncate max-w-[130px]">{currentApp}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showAppMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                      Enterprise Ecosystem
                    </span>
                    {apps.map((app) => (
                      <button
                        key={app}
                        onClick={() => {
                          onAppChange(app);
                          setShowAppMenu(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition',
                          currentApp === app
                            ? 'bg-blue-600 text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-700'
                        )}
                      >
                        <span>{app}</span>
                        {currentApp === app && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button
                  id="glass-header-lang"
                  onClick={() => {
                    setShowLangMenu(!showLangMenu);
                    setShowAppMenu(false);
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-white/70 hover:bg-white rounded-full text-slate-700 shadow-xs border border-white/80 transition"
                  title="Language Selector"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentLanguage}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          onLanguageChange(l.code);
                          setShowLangMenu(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-xs rounded-xl flex items-center justify-between transition',
                          currentLanguage === l.code
                            ? 'bg-blue-600 text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-700'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                        {currentLanguage === l.code && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  id="glass-header-user-btn"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowAppMenu(false);
                    setShowLangMenu(false);
                  }}
                  className="flex items-center gap-2 p-1 pl-2.5 bg-white/70 hover:bg-white rounded-full shadow-xs border border-white/80 transition"
                  title="User Profile"
                >
                  <span className="text-xs font-bold text-slate-800 hidden xl:inline">Marcus A.</span>
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                    alt="Marcus"
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/20"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <Image
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                        alt="Marcus"
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover shadow-sm"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Marcus Aurelius</h4>
                        <span className="text-[11px] text-blue-600 font-semibold block">Chief Risk Officer</span>
                        <span className="text-[10px] text-slate-400">Clearance Level 4</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Canvas Slot */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
