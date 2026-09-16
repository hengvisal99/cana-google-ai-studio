'use client';

import React, { useRef, useState } from 'react';
import { NavigationPage, DesignTheme, SupportedLanguage, EnterpriseApp } from '@/types';
import {
  LayoutDashboard,
  Users,
  User,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { HeaderActions } from '@/components/shared/HeaderActions';
import { useScrollbarWidth } from '@/hooks/use-scrollbar-width';
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
  const customerSubItems: { label: string; page: NavigationPage; active: boolean }[] = [
    {
      label: 'List',
      page: 'individual-list',
      active: currentPage === 'individual-list' || currentPage === 'individual-update',
    },
    { label: 'Create', page: 'individual-insert', active: currentPage === 'individual-insert' },
    { label: 'Customer Type', page: 'customer-type', active: currentPage === 'customer-type' },
  ];

  return (
    <div
      id="aurora-layout"
      className="h-screen overflow-hidden bg-[#F0F4F8] text-slate-900 flex flex-col antialiased"
      style={{ '--sbw': `${scrollbarWidth}px` } as React.CSSProperties}
    >
      {/* Dynamic Top Aurora Radiant Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 shrink-0" />

      {/* =========================================================================
          AURORA HEADER: High-Tech Studio Bar
         ========================================================================= */}
      <header
        id="aurora-header"
        className="shrink-0 z-30 bg-white border-b border-slate-200 pl-4 sm:pl-6 pr-[calc(1rem_+_var(--sbw,0px))] sm:pr-[calc(1.5rem_+_var(--sbw,0px))] py-3 flex items-center justify-between gap-4 shadow-xs"
      >
        {/* Left: Sidebar Toggle */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="aurora-sidebar-toggle"
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition shrink-0"
            aria-label="Toggle Sidebar"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
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

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* =========================================================================
            AURORA SIDEBAR: Dynamic Tech Studio Sidebar
           ========================================================================= */}
        <aside
          id="aurora-sidebar"
          aria-label="Aurora Navigation Sidebar"
          className={cn(
            'bg-white border-r border-slate-200 flex flex-col shrink-0 h-full min-h-0 transition-all duration-200 z-20',
            sidebarCollapsed ? 'w-18' : 'w-64'
          )}
        >
          {/* Navigation Menus */}
          <nav className="flex-1 min-h-0 p-3 space-y-6 overflow-y-auto text-xs">
            <div>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
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
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-150',
                    currentPage === 'dashboard'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25'
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
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-150',
                    currentPage === 'customer-360'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Customer 360"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Customer 360</span>}
                </button>
                {/* Customer: expandable group (List, Create, Customer Type) */}
                <button
                  id="aurora-nav-customer"
                  type="button"
                  onClick={() =>
                    sidebarCollapsed ? onNavigate('individual-list') : setCustomerMenuOpen(!customerMenuOpen)
                  }
                  aria-expanded={!sidebarCollapsed && customerMenuOpen}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-150',
                    isCustomerPage
                      ? sidebarCollapsed || !customerMenuOpen
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25'
                        : 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Customer"
                >
                  <User className="w-4 h-4 shrink-0" />
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
                  <div className="ml-5.5 space-y-1 border-l border-slate-200 pl-3">
                    {customerSubItems.map((item) => (
                      <button
                        key={item.page}
                        id={`aurora-nav-customer-${item.page}`}
                        type="button"
                        onClick={() => onNavigate(item.page)}
                        className={cn(
                          'w-full flex items-center px-3 py-2 rounded-lg text-left font-semibold transition-all duration-150',
                          item.active
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/25'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Bottom Pulse Meter */}
          {!sidebarCollapsed && (
            <div className="shrink-0 p-3.5 m-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 mb-1">
                <span>Cluster Throughput</span>
                <span className="text-blue-600 font-mono">99.98%</span>
              </div>
              <div className="w-full h-1.5 bg-blue-200/60 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              </div>
            </div>
          )}
        </aside>

        {/* Content Deck */}
        <main ref={mainRef} className="flex-1 min-h-0 min-w-0 overflow-y-auto [scrollbar-gutter:stable] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
