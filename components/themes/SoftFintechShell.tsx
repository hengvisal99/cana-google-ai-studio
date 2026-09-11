'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { NavigationPage, DesignTheme, SupportedLanguage, EnterpriseApp } from '@/types';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Layers, 
  Globe, 
  Menu, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Bell, 
  TrendingUp,
  SlidersHorizontal,
  LogOut,
  User
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

export function SoftFintechShell({
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
        return 'Executive Dashboard';
      case 'customer-360':
        return 'Customer 360 Workspace';
      case 'individual-list':
        return 'Individual Directory';
      case 'individual-insert':
        return 'Individual Registration (Insert)';
      case 'individual-update':
        return 'Individual File Management (Update)';
    }
  };

  return (
    <div id="soft-fintech-layout" className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
      <div className="flex flex-1 overflow-hidden">
        {/* =========================================================================
            SOFT FINTECH SIDEBAR: Solid Classic High-Density Left Enterprise Sidebar
           ========================================================================= */}
        <aside
          id="soft-fintech-sidebar"
          aria-label="Soft FinTech Navigation Sidebar"
          className={cn(
            'bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 z-30',
            sidebarCollapsed ? 'w-18' : 'w-64'
          )}
        >
          {/* Company Brand Box */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                    NEXUS SYSTEM
                  </h1>
                  <span className="text-[10px] text-blue-600 font-semibold block truncate">
                    Enterprise FinTech 360
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menus (Prompt: Dashboard, Customer 360, Individual: List, Insert, Update) */}
          <nav className="flex-1 p-3 space-y-6 overflow-y-auto text-xs">
            {/* Group 1: Core Systems */}
            <div>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
                  Core Management
                </span>
              )}
              <div className="space-y-1">
                {/* Dashboard */}
                <button
                  id="nav-btn-dashboard"
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all relative',
                    currentPage === 'dashboard'
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-600" />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>

                {/* Customer 360 */}
                <button
                  id="nav-btn-customer-360"
                  type="button"
                  onClick={() => onNavigate('customer-360')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all relative',
                    currentPage === 'customer-360'
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Customer 360 (Left Customer Sidebar)"
                >
                  <Users className="w-4 h-4 shrink-0 text-blue-600" />
                  {!sidebarCollapsed && <span className="truncate">Customer 360</span>}
                </button>

                {/* Individual */}
                <button
                  id="nav-btn-individual"
                  type="button"
                  onClick={() => onNavigate('individual-list')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all relative',
                    currentPage === 'individual-list' || currentPage === 'individual-insert' || currentPage === 'individual-update'
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Individual (Directory)"
                >
                  <User className="w-4 h-4 shrink-0 text-blue-600" />
                  {!sidebarCollapsed && <span className="truncate">Individual</span>}
                </button>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer Compliance Status */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold truncate">KYC/AML Automated Shield Active</span>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* =========================================================================
              SOFT FINTECH HEADER: Precision Banking Header
             ========================================================================= */}
          <header
            id="soft-fintech-header"
            className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 shadow-xs"
          >
            {/* Left: Sidebar Toggle */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                id="soft-fintech-sidebar-toggle"
                onClick={onToggleSidebar}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                title="Toggle Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Switch Application + Theme Selector + Language + User Profile */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Switch Application Dropdown */}
              <div className="relative">
                <button
                  id="header-app-switch-btn"
                  onClick={() => {
                    setShowAppMenu(!showAppMenu);
                    setShowLangMenu(false);
                    setShowUserMenu(false);
                    setShowThemeMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 rounded-lg text-slate-700 transition"
                  title="Switch Application"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline truncate max-w-[140px]">{currentApp}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showAppMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 block">
                      Switch Enterprise App
                    </span>
                    {apps.map((app) => (
                      <button
                        key={app}
                        onClick={() => {
                          onAppChange(app);
                          setShowAppMenu(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition',
                          currentApp === app
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <span>{app}</span>
                        {currentApp === app && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Selector Dropdown */}
              <div className="relative">
                <button
                  id="header-theme-selector-btn"
                  onClick={() => {
                    setShowThemeMenu(!showThemeMenu);
                    setShowAppMenu(false);
                    setShowLangMenu(false);
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 rounded-lg text-slate-700 transition"
                  title="Theme Selector"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="hidden sm:inline capitalize">
                    {currentTheme === 'soft-fintech' ? 'Soft FinTech' : currentTheme === 'glassmorphism' ? 'Glassmorphism' : 'Aurora'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showThemeMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 block">
                      Design Theme Template
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
                          'w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition',
                          currentTheme === t.id
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <span>{t.label}</span>
                        {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  id="header-language-btn"
                  onClick={() => {
                    setShowLangMenu(!showLangMenu);
                    setShowAppMenu(false);
                    setShowUserMenu(false);
                    setShowThemeMenu(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 rounded-lg text-slate-700 transition"
                  title="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentLanguage}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 block">
                      Language Selector
                    </span>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          onLanguageChange(l.code);
                          setShowLangMenu(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition',
                          currentLanguage === l.code
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                        {currentLanguage === l.code && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  id="header-user-profile-btn"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowAppMenu(false);
                    setShowLangMenu(false);
                    setShowThemeMenu(false);
                  }}
                  className="flex items-center gap-2 p-1 pl-2 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition"
                  title="User Profile"
                >
                  <div className="text-right hidden xl:block">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">Marcus Aurelius</span>
                    <span className="text-[10px] text-blue-600 font-semibold block leading-tight">Chief Risk Officer</span>
                  </div>
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                    alt="User Avatar"
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <Image
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                        alt="Marcus"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Marcus Aurelius</h4>
                        <span className="text-[11px] text-slate-500 block">m.aurelius@nexusbank.com</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded">
                          ● Online (Level 4 Officer)
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 text-xs space-y-1">
                      <div className="px-2 py-1 text-slate-500 flex justify-between">
                        <span>Role Clearance</span>
                        <strong className="text-slate-800">Executive / CRO</strong>
                      </div>
                      <div className="px-2 py-1 text-slate-500 flex justify-between">
                        <span>Terminal ID</span>
                        <strong className="text-slate-800 font-mono">NY-TERM-884</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content Slot */}
          <main className="p-6 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
