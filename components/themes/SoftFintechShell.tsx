'use client';

import React, { useRef, useState } from 'react';
import { NavigationPage, DesignTheme, SupportedLanguage, EnterpriseApp } from '@/types';
import {
  Building2,
  LayoutDashboard,
  LayoutList,
  Users,
  Menu,
  ChevronDown,
  Workflow,
  ShieldCheck,
  User,
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

export function SoftFintechShell({
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
    currentPage === 'individual-update';
  const customerSubItems: { label: string; page: NavigationPage; active: boolean }[] = [
    {
      label: 'List',
      page: 'individual-list',
      active:
        currentPage === 'individual-list' ||
        currentPage === 'individual-update' ||
        currentPage === 'individual-insert',
    },
  ];

  return (
    <div
      id="soft-fintech-layout"
      className="h-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col antialiased"
      style={{ '--sbw': `${scrollbarWidth}px` } as React.CSSProperties}
    >
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* =========================================================================
            SOFT FINTECH SIDEBAR: Solid Classic High-Density Left Enterprise Sidebar
           ========================================================================= */}
        <aside
          id="soft-fintech-sidebar"
          aria-label="Soft FinTech Navigation Sidebar"
          className={cn(
            'bg-white border-r border-slate-200 flex flex-col shrink-0 h-full min-h-0 transition-all duration-200 z-30',
            sidebarCollapsed ? 'w-18' : 'w-64'
          )}
        >
          {/* Company Brand Box */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white font-semibold shadow-xs shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-xs font-semibold text-slate-900 uppercase tracking-wider truncate">
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
          <nav className="flex-1 min-h-0 p-3 space-y-6 overflow-y-auto text-xs">
            {/* Group 1: Core Systems */}
            <div>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
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
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-500'
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
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-500'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Customer 360 (Left Customer Sidebar)"
                >
                  <Users className="w-4 h-4 shrink-0 text-blue-600" />
                  {!sidebarCollapsed && <span className="truncate">Customer 360</span>}
                </button>

                {/* Customer: expandable group (List) */}
                <button
                  id="nav-btn-customer"
                  type="button"
                  onClick={() =>
                    sidebarCollapsed ? onNavigate('individual-list') : setCustomerMenuOpen(!customerMenuOpen)
                  }
                  aria-expanded={!sidebarCollapsed && customerMenuOpen}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all relative',
                    isCustomerPage
                      ? sidebarCollapsed || !customerMenuOpen
                        ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-500'
                        : 'text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Customer"
                >
                  <User className="w-4 h-4 shrink-0 text-blue-600" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate text-left">Customer</span>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform',
                          !customerMenuOpen && '-rotate-90'
                        )}
                      />
                    </>
                  )}
                </button>

                {!sidebarCollapsed && customerMenuOpen && (
                  <div className="ml-5 space-y-0.5 border-l border-slate-200 pl-3">
                    {customerSubItems.map((item) => (
                      <button
                        key={item.page}
                        id={`nav-btn-customer-${item.page}`}
                        type="button"
                        onClick={() => onNavigate(item.page)}
                        className={cn(
                          'w-full flex items-center px-3 py-2 rounded-lg text-left font-semibold transition-all',
                          item.active
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Sale Pipeline */}
                <button
                  id="nav-btn-sale-pipeline"
                  type="button"
                  onClick={() => onNavigate('customer-type')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all relative',
                    currentPage === 'customer-type'
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-500'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title="Sale Pipeline"
                >
                  <Workflow className="w-4 h-4 shrink-0 text-blue-600" />
                  {!sidebarCollapsed && <span className="truncate">Sale Pipeline</span>}
                </button>
              </div>
            </div>

            {/* Group 2: Design System */}
            <div>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
                  Design System
                </span>
              )}
              <button
                id="nav-btn-form-fields"
                type="button"
                onClick={() => onNavigate('form-fields')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all relative',
                  currentPage === 'form-fields'
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-500'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
                title="Form Fields"
              >
                <LayoutList className="w-4 h-4 shrink-0 text-blue-600" />
                {!sidebarCollapsed && <span className="truncate">Form Fields</span>}
              </button>
            </div>
          </nav>

          {/* Sidebar Footer Compliance Status */}
          {!sidebarCollapsed && (
            <div className="shrink-0 p-3 border-t border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold truncate">KYC/AML Automated Shield Active</span>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area — the only scrolling region */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {/* =========================================================================
              SOFT FINTECH HEADER: Precision Banking Header
             ========================================================================= */}
          <header
            id="soft-fintech-header"
            className="shrink-0 z-20 bg-white border-b border-slate-200 pl-4 sm:pl-6 pr-[calc(1rem_+_var(--sbw,0px))] sm:pr-[calc(1.5rem_+_var(--sbw,0px))] py-3 flex items-center justify-between gap-4 shadow-xs"
          >
            {/* Left: Sidebar Toggle */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                id="soft-fintech-sidebar-toggle"
                type="button"
                onClick={onToggleSidebar}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition shrink-0"
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

          {/* Content Slot — scrolls independently of the sidebar */}
          <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable] p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
