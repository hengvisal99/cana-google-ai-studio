'use client';

import React, { useRef, useState } from 'react';
import { NavigationPage, DesignTheme, SupportedLanguage, EnterpriseApp } from '@/types';
import {
  LayoutDashboard,
  LayoutList,
  Users,
  User,
  Menu,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { HeaderActions } from '@/components/shared/HeaderActions';
import { useScrollbarWidth } from '@/hooks/use-scrollbar-width';
import { cn } from '@/lib/utils';

/* Active-state styling lifted from sidebar version 01 (Cobalt Rail): a soft blue
   row with a 3px blue bar when expanded, and blue text with no fill on a parent
   whose sub item is the selected one. Collapsed is the exception: the active icon
   becomes a square white tile with a blue glyph, separated from the bg-white/80
   dock by a blue-100 outline and its drop shadow rather than by fill. */
const ACTIVE_ROW = 'bg-blue-50 text-blue-700';
const ACTIVE_TILE = 'bg-white text-blue-600 ring-1 ring-blue-100 shadow-lg shadow-slate-300/70';
const ACTIVE_PARENT = 'text-blue-700 hover:bg-blue-50/70';
const IDLE_ROW = 'text-slate-600 hover:text-slate-900 hover:bg-white/70';
// Sits at left-0 rather than outside the row: <nav> scrolls on Y, so anything
// past its left edge gets clipped.
const ACTIVE_BAR = 'absolute left-0 h-5 w-[3px] rounded-full bg-blue-600';

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
  currentLanguage,
  onLanguageChange,
  currentApp,
  onAppChange,
  sidebarCollapsed,
  onToggleSidebar,
  children,
}: ShellProps) {
  const [customerMenuOpen, setCustomerMenuOpen] = useState(true);
  const mainRef = useRef<HTMLElement>(null);
  const scrollbarWidth = useScrollbarWidth(mainRef);

  const isCustomerPage =
    currentPage === 'individual-list' ||
    currentPage === 'individual-insert' ||
    currentPage === 'individual-update' ||
    currentPage === 'customer-type';
  // Icons grow in the collapsed dock and carry the blue in both states.
  const navIcon = (active: boolean) =>
    cn('shrink-0', sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4', active && 'text-blue-600');

  const customerSubItems: { label: string; page: NavigationPage; active: boolean }[] = [
    {
      label: 'List',
      page: 'individual-list',
      active:
        currentPage === 'individual-list' ||
        currentPage === 'individual-update' ||
        currentPage === 'individual-insert',
    },
    { label: 'Customer Type', page: 'customer-type', active: currentPage === 'customer-type' },
  ];

  return (
    <div
      id="glassmorphism-layout"
      className="h-screen overflow-hidden bg-[#F1F5F9] text-slate-800 flex flex-col antialiased relative selection:bg-blue-100"
      style={{ '--sbw': `${scrollbarWidth}px` } as React.CSSProperties}
    >
      {/* Right padding lives inside <main> instead, so its scrollbar sits at the window edge */}
      <div className="flex flex-1 min-h-0 overflow-hidden py-3 sm:py-5 pl-3 sm:pl-5 gap-5">
        {/* =========================================================================
            GLASSMORPHISM SIDEBAR: Floating Detached Island Dock
           ========================================================================= */}
        <aside
          id="glassmorphism-sidebar"
          aria-label="Glassmorphism Navigation Dock"
          className={cn(
            'bg-white/80 backdrop-blur-2xl border border-white/90 shadow-xl shadow-slate-300/40 rounded-3xl flex flex-col shrink-0 h-full min-h-0 transition-all duration-300 z-30',
            sidebarCollapsed ? 'w-20 p-3 items-center' : 'w-64 p-5'
          )}
        >
          {/* Frosted Brand Capsule */}
          <div
            className={cn(
              'flex items-center gap-3 pb-5 border-b border-slate-200/60 w-full shrink-0',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-slate-900 tracking-wide uppercase leading-tight truncate">
                  Cana Securities
                </h1>
                <span className="text-xs text-blue-600 font-semibold block leading-tight truncate">
                  Customer Operations
                </span>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 min-h-0 py-5 space-y-6 overflow-y-auto w-full text-xs">
            <div>
              <div className="space-y-1.5">
                {/* Dashboard */}
                <button
                  id="glass-nav-dashboard"
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200',
                    sidebarCollapsed ? 'h-11 w-11 mx-auto justify-center' : 'w-full px-3.5 py-3',
                    currentPage === 'dashboard'
                      ? sidebarCollapsed
                        ? ACTIVE_TILE
                        : ACTIVE_ROW
                      : IDLE_ROW
                  )}
                  title="Dashboard"
                >
                  {currentPage === 'dashboard' && !sidebarCollapsed && <span className={ACTIVE_BAR} />}
                  <LayoutDashboard className={navIcon(currentPage === 'dashboard')} />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>

                {/* Customer 360 */}
                <button
                  id="glass-nav-customer-360"
                  type="button"
                  onClick={() => onNavigate('customer-360')}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200',
                    sidebarCollapsed ? 'h-11 w-11 mx-auto justify-center' : 'w-full px-3.5 py-3',
                    currentPage === 'customer-360'
                      ? sidebarCollapsed
                        ? ACTIVE_TILE
                        : ACTIVE_ROW
                      : IDLE_ROW
                  )}
                  title="Customer 360"
                >
                  {currentPage === 'customer-360' && !sidebarCollapsed && <span className={ACTIVE_BAR} />}
                  <Users className={navIcon(currentPage === 'customer-360')} />
                  {!sidebarCollapsed && <span>Customer 360</span>}
                </button>

                {/* Customer: expandable group (List, Create, Customer Type) */}
                <button
                  id="glass-nav-customer"
                  type="button"
                  onClick={() =>
                    sidebarCollapsed ? onNavigate('individual-list') : setCustomerMenuOpen(!customerMenuOpen)
                  }
                  aria-expanded={!sidebarCollapsed && customerMenuOpen}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200',
                    sidebarCollapsed ? 'h-11 w-11 mx-auto justify-center' : 'w-full px-3.5 py-3',
                    isCustomerPage
                      ? sidebarCollapsed
                        ? ACTIVE_TILE
                        : customerMenuOpen
                          ? ACTIVE_PARENT
                          : ACTIVE_ROW
                      : IDLE_ROW
                  )}
                  title="Customer"
                >
                  {isCustomerPage && !sidebarCollapsed && !customerMenuOpen && <span className={ACTIVE_BAR} />}
                  <User className={navIcon(isCustomerPage)} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">Customer</span>
                      <ChevronDown
                        className={cn('w-3.5 h-3.5 shrink-0 transition-transform', !customerMenuOpen && '-rotate-90')}
                      />
                    </>
                  )}
                </button>

                {!sidebarCollapsed && customerMenuOpen && (
                  <div className="ml-5.5 space-y-1 border-l border-slate-200/80 pl-3">
                    {customerSubItems.map((item) => (
                      <button
                        key={item.page}
                        id={`glass-nav-customer-${item.page}`}
                        type="button"
                        onClick={() => onNavigate(item.page)}
                        className={cn(
                          'relative w-full flex items-center px-3 py-2 rounded-xl text-left font-semibold transition-all duration-200',
                          item.active
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                        )}
                      >
                        {item.active && (
                          <span className="absolute -left-[13px] h-4 w-[3px] rounded-full bg-blue-600" />
                        )}
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
                  Design System
                </span>
              )}
              <button
                id="glass-nav-form-fields"
                type="button"
                onClick={() => onNavigate('form-fields')}
                className={cn(
                  'relative flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200',
                  sidebarCollapsed ? 'h-11 w-11 mx-auto justify-center' : 'w-full px-3.5 py-3',
                  currentPage === 'form-fields'
                    ? sidebarCollapsed
                      ? ACTIVE_TILE
                      : ACTIVE_ROW
                    : IDLE_ROW
                )}
                title="Form Fields"
              >
                {currentPage === 'form-fields' && !sidebarCollapsed && <span className={ACTIVE_BAR} />}
                <LayoutList className={navIcon(currentPage === 'form-fields')} />
                {!sidebarCollapsed && <span>Form Fields</span>}
              </button>
            </div>
          </nav>


        </aside>

        {/* Content Island Deck — only this column scrolls */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-5">
          {/* =========================================================================
              GLASSMORPHISM HEADER: Floating Translucent Pill Header
             ========================================================================= */}
          <header
            id="glassmorphism-header"
            className="bg-white/80 backdrop-blur-2xl border border-white/90 shadow-lg shadow-slate-300/30 rounded-2xl px-4 sm:px-6 py-3 mr-[calc(0.75rem_+_var(--sbw,0px))] sm:mr-[calc(1.25rem_+_var(--sbw,0px))] flex items-center justify-between gap-4 shrink-0"
          >
            {/* Left: Sidebar Toggle */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                id="glass-sidebar-toggle"
                type="button"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 shadow-xs transition shrink-0"
                aria-label="Toggle Sidebar"
                title="Toggle Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            {/* Right: App icon + Language icon + Theme icon + Profile with name */}
            <HeaderActions
              currentTheme={currentTheme}
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              currentApp={currentApp}
              onAppChange={onAppChange}
            />
          </header>

          {/* Page Canvas Slot — the single scroll region */}
          <main
            ref={mainRef}
            className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable] pr-3 sm:pr-5 pb-1"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
