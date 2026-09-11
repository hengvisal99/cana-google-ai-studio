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
  Zap,
  Activity,
  Terminal
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

export function AuroraShell({
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
  const [showThemeMenu, setShowThemeMenu] = useState(false);

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
        return 'Aurora Command Center';
      case 'customer-360':
        return 'Customer 360 Radar';
      case 'individual-list':
        return 'Individual Directory Studio';
      case 'individual-insert':
        return 'Insert Client Record (Screen)';
      case 'individual-update':
        return 'Update Client Dossier (Screen)';
    }
  };

  return (
    <div id="aurora-layout" className="min-h-screen bg-[#F0F4F8] text-slate-900 flex flex-col antialiased">
      {/* Dynamic Top Aurora Radiant Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 shrink-0" />

      {/* =========================================================================
          AURORA HEADER: High-Tech Studio Bar
         ========================================================================= */}
      <header
        id="aurora-header"
        className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs"
      >
        {/* Left: Sidebar Toggle */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="aurora-sidebar-toggle"
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Switch Application + Theme Selector + Language + User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Switch Application Dropdown */}
          <div className="relative">
            <button
              id="aurora-header-app-switch"
              onClick={() => {
                setShowAppMenu(!showAppMenu);
                setShowLangMenu(false);
                setShowUserMenu(false);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200/80 rounded-xl text-slate-800 transition"
              title="Switch Application"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline truncate max-w-[140px]">{currentApp}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showAppMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                  Enterprise Applications
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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold'
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

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              id="aurora-header-theme-selector"
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowAppMenu(false);
                setShowLangMenu(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-blue-700 transition"
              title="Theme Selector"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Aurora / Gradient</span>
              <ChevronDown className="w-3 h-3 text-blue-500" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                  Theme Templates
                </span>
                {[
                  { id: 'soft-fintech', label: 'Soft FinTech' },
                  { id: 'glassmorphism', label: 'Glassmorphism' },
                  { id: 'aurora', label: 'Aurora / Gradient' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onThemeChange(t.id as any);
                      setShowThemeMenu(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition',
                      currentTheme === t.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    )}
                  >
                    <span>{t.label}</span>
                    {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              id="aurora-header-lang"
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowAppMenu(false);
                setShowUserMenu(false);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200/80 rounded-xl text-slate-700 transition"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentLanguage}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold'
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
              id="aurora-header-user-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowAppMenu(false);
                setShowLangMenu(false);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
              title="User Profile"
            >
              <div className="text-right hidden xl:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">Marcus Aurelius</span>
                <span className="text-[10px] text-blue-600 font-semibold block leading-tight">Chief Risk Officer</span>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                alt="Marcus"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500"
                referrerPolicy="no-referrer"
                unoptimized
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                    alt="Marcus"
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Marcus Aurelius</h4>
                    <span className="text-[11px] text-blue-600 font-semibold block">Chief Risk Officer</span>
                    <span className="text-[10px] text-emerald-600 font-bold">● Active Session</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* =========================================================================
            AURORA SIDEBAR: Dynamic Tech Studio Sidebar
           ========================================================================= */}
        <aside
          id="aurora-sidebar"
          aria-label="Aurora Navigation Sidebar"
          className={cn(
            'bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 z-20',
            sidebarCollapsed ? 'w-18' : 'w-64'
          )}
        >
          {/* Navigation Menus */}
          <nav className="flex-1 p-3 space-y-6 overflow-y-auto text-xs">
            <div>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
                  Studio Operations
                </span>
              )}
              <div className="space-y-1.5">
                {/* Dashboard */}
                <button
                  id="aurora-nav-dashboard"
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all duration-150',
                    currentPage === 'dashboard'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>

                {/* Customer 360 */}
                <button
                  id="aurora-nav-customer-360"
                  type="button"
                  onClick={() => onNavigate('customer-360')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all duration-150',
                    currentPage === 'customer-360'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Customer 360"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Customer 360</span>}
                </button>
                {/* Individual */}
                <button
                  id="aurora-nav-individual"
                  type="button"
                  onClick={() => onNavigate('individual-list')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all duration-150',
                    currentPage === 'individual-list' || currentPage === 'individual-insert' || currentPage === 'individual-update'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Individual (Directory)"
                >
                  <User className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Individual</span>}
                </button>
              </div>
            </div>
          </nav>

          {/* Bottom Pulse Meter */}
          {!sidebarCollapsed && (
            <div className="p-3.5 m-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-1">
                <span>Cluster Throughput</span>
                <span className="text-blue-600 font-mono">99.98%</span>
              </div>
              <div className="w-full h-1.5 bg-blue-200/60 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
              </div>
            </div>
          )}
        </aside>

        {/* Content Deck */}
        <main className="flex-1 p-6 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
