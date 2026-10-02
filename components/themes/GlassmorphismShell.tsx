'use client';

import React, { useRef, useState } from 'react';
import { NavigationPage, SupportedLanguage, EnterpriseApp, AppNotification, AppUserRole } from '@/types';
import type { CustomerCase } from '@/types';
import {
  LayoutDashboard,
  LayoutList,
  Users,
  User,
  Menu,
  ChevronDown,
  Compass,
  Workflow,
  Settings,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  CheckSquare,
  Briefcase,
  ScanFace,
  Award,
  Globe,
  Search,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Tags,
} from 'lucide-react';
import { HeaderActions } from '@/components/shared/HeaderActions';
import { NotificationBell } from '@/components/shared/NotificationBell';
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
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  currentApp: EnterpriseApp;
  onAppChange: (app: EnterpriseApp) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  currentRole?: AppUserRole;
  onRoleChange?: (role: AppUserRole) => void;
  onOpenSearch?: () => void;
  cases?: CustomerCase[];
  children: React.ReactNode;
}

export function GlassmorphismShell({
  currentPage,
  onNavigate,
  currentLanguage,
  onLanguageChange,
  currentApp,
  onAppChange,
  sidebarCollapsed,
  onToggleSidebar,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  currentRole,
  onRoleChange,
  onOpenSearch,
  cases = [],
  children,
}: ShellProps) {
  // Accordion: opening one group closes the others.
  type MenuGroup = 'crm' | 'trading' | 'risk' | 'analytics' | 'settings';
  const [openMenu, setOpenMenu] = useState<MenuGroup | null>(null);
  const groupSetter = (group: MenuGroup) => (open: boolean) =>
    setOpenMenu(open ? group : (current) => (current === group ? null : current));
  const crmMenuOpen = openMenu === 'crm';
  const tradingMenuOpen = openMenu === 'trading';
  const riskMenuOpen = openMenu === 'risk';
  const analyticsMenuOpen = openMenu === 'analytics';
  const settingsMenuOpen = openMenu === 'settings';
  const setCrmMenuOpen = groupSetter('crm');
  const setTradingMenuOpen = groupSetter('trading');
  const setRiskMenuOpen = groupSetter('risk');
  const setAnalyticsMenuOpen = groupSetter('analytics');
  const setSettingsMenuOpen = groupSetter('settings');

  const mainRef = useRef<HTMLElement>(null);
  const scrollbarWidth = useScrollbarWidth(mainRef);

  const isCrmPage =
    currentPage === 'pipeline' ||
    currentPage === 'individual-list' ||
    currentPage === 'individual-insert' ||
    currentPage === 'individual-update' ||
    currentPage === 'customer-type' ||
    currentPage === 'customer-360';

  const isTradingPage =
    currentPage === 'portfolio' ||
    currentPage === 'csx-live' ||
    currentPage === 'ipo-management';

  const isRiskPage =
    currentPage === 'compliance' ||
    currentPage === 'tasks' ||
    currentPage === 'cases' ||
    currentPage === 'my-work';

  const isAnalyticsPage =
    currentPage === 'reports' ||
    currentPage === 'customer-report' ||
    currentPage === 'performance';

  const isSettingsPage = currentPage === 'master-data';

  // When the active page moves to another group, open that group (and close the rest).
  const activeGroup: MenuGroup | null = isCrmPage ? 'crm'
    : isTradingPage ? 'trading'
    : isRiskPage ? 'risk'
    : isAnalyticsPage ? 'analytics'
    : isSettingsPage ? 'settings'
    : null;
  const [prevActiveGroup, setPrevActiveGroup] = useState(activeGroup);
  if (activeGroup !== prevActiveGroup) {
    setPrevActiveGroup(activeGroup);
    setOpenMenu(activeGroup);
  }

  const openCasesCount = cases.filter(c => c.status !== 'Closed' && c.status !== 'Resolved').length;

  // Icons grow in the collapsed dock and carry the blue in both states.
  const navIcon = (active: boolean) =>
    cn('shrink-0', sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4', active && 'text-blue-600');

  return (
    <div
      id="glassmorphism-layout"
      className="h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 flex flex-col antialiased relative selection:bg-blue-100"
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
            'bg-white/80 backdrop-blur-2xl border border-white/90 shadow-xl shadow-slate-300/40 rounded-3xl flex flex-col shrink-0 h-full min-h-0 transition-[width,padding] duration-300 ease-out z-30',
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
                {/* <span className="text-xs text-blue-600 font-semibold block leading-tight truncate">
                  Customer Operations
                </span> */}
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

                {/* ── CRM & Sales Group ── */}
                <button
                  id="glass-nav-crm"
                  type="button"
                  onClick={() =>
                    sidebarCollapsed ? onNavigate('pipeline') : setCrmMenuOpen(!crmMenuOpen)
                  }
                  aria-expanded={!sidebarCollapsed && crmMenuOpen}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200 mt-2',
                    sidebarCollapsed ? 'h-11 w-11 mx-auto justify-center' : 'w-full px-3.5 py-3',
                    isCrmPage ? sidebarCollapsed ? ACTIVE_TILE : crmMenuOpen ? ACTIVE_PARENT : ACTIVE_ROW : IDLE_ROW
                  )}
                  title="CRM & Sales"
                >
                  {isCrmPage && !sidebarCollapsed && !crmMenuOpen && <span className={ACTIVE_BAR} />}
                  <Users className={navIcon(isCrmPage)} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">CRM & Sales</span>
                      <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 transition-transform', !crmMenuOpen && '-rotate-90')} />
                    </>
                  )}
                </button>

                {!sidebarCollapsed && crmMenuOpen && (
                  <div className="ml-5.5 space-y-1 border-l border-slate-200/80 pl-3">
                    {[
                      { label: 'Leads Pipeline', page: 'pipeline' as NavigationPage, icon: Workflow },
                      { label: 'Customers', page: 'individual-list' as NavigationPage, icon: User },
                      { label: 'Customer Product', page: 'customer-type' as NavigationPage, icon: Tags },
                      { label: 'Customer 360', page: 'customer-360' as NavigationPage, icon: Users },
                    ].map((item) => (
                      <button
                        key={item.page}
                        id={`glass-nav-crm-${item.page}`}
                        type="button"
                        onClick={() => onNavigate(item.page)}
                        className={cn(
                          'relative w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-semibold transition-all duration-200',
                          (currentPage === item.page || (item.page === 'individual-list' && (currentPage === 'individual-insert' || currentPage === 'individual-update')))
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                        )}
                      >
                        {(currentPage === item.page || (item.page === 'individual-list' && (currentPage === 'individual-insert' || currentPage === 'individual-update'))) && (
                          <span className="absolute -left-[13px] h-4 w-[3px] rounded-full bg-blue-600" />
                        )}
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Trading & Market Group ── */}
                <button
                  id="glass-nav-trading"
                  type="button"
                  onClick={() =>
                    sidebarCollapsed ? onNavigate('portfolio') : setTradingMenuOpen(!tradingMenuOpen)
                  }
                  aria-expanded={!sidebarCollapsed && tradingMenuOpen}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200 mt-2',
                    sidebarCollapsed ? 'h-11 w-11 mx-auto justify-center' : 'w-full px-3.5 py-3',
                    isTradingPage ? sidebarCollapsed ? ACTIVE_TILE : tradingMenuOpen ? ACTIVE_PARENT : ACTIVE_ROW : IDLE_ROW
                  )}
                  title="Trading & Market"
                >
                  {isTradingPage && !sidebarCollapsed && !tradingMenuOpen && <span className={ACTIVE_BAR} />}
                  <TrendingUp className={navIcon(isTradingPage)} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">Trading & Market</span>
                      <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 transition-transform', !tradingMenuOpen && '-rotate-90')} />
                    </>
                  )}
                </button>

                {!sidebarCollapsed && tradingMenuOpen && (
                  <div className="ml-5.5 space-y-1 border-l border-slate-200/80 pl-3">
                    {[
                      { label: 'Portfolio', page: 'portfolio' as NavigationPage, icon: Briefcase },
                      { label: 'CSX Live Market', page: 'csx-live' as NavigationPage, icon: Globe },
                      { label: 'IPO Management', page: 'ipo-management' as NavigationPage, icon: TrendingUp },
                    ].map((item) => (
                      <button
                        key={item.page}
                        id={`glass-nav-trading-${item.page}`}
                        type="button"
                        onClick={() => onNavigate(item.page)}
                        className={cn(
                          'relative w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-semibold transition-all duration-200',
                          currentPage === item.page ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                        )}
                      >
                        {currentPage === item.page && <span className="absolute -left-[13px] h-4 w-[3px] rounded-full bg-blue-600" />}
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Risk & Operations Group ── */}
                <button
                  id="glass-nav-risk"
                  type="button"
                  onClick={() =>
                    sidebarCollapsed ? onNavigate('compliance') : setRiskMenuOpen(!riskMenuOpen)
                  }
                  aria-expanded={!sidebarCollapsed && riskMenuOpen}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200 mt-2',
                    sidebarCollapsed ? 'h-11 w-11 mx-auto justify-center' : 'w-full px-3.5 py-3',
                    isRiskPage ? sidebarCollapsed ? ACTIVE_TILE : riskMenuOpen ? ACTIVE_PARENT : ACTIVE_ROW : IDLE_ROW
                  )}
                  title="Risk & Operations"
                >
                  {isRiskPage && !sidebarCollapsed && !riskMenuOpen && <span className={ACTIVE_BAR} />}
                  <ShieldCheck className={navIcon(isRiskPage)} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">Risk & Operations</span>
                      <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 transition-transform', !riskMenuOpen && '-rotate-90')} />
                    </>
                  )}
                </button>

                {!sidebarCollapsed && riskMenuOpen && (
                  <div className="ml-5.5 space-y-1 border-l border-slate-200/80 pl-3">
                    {[
                      { label: 'My Work', page: 'my-work' as NavigationPage, icon: Sparkles },
                      { label: 'Approval Tasks', page: 'tasks' as NavigationPage, icon: CheckSquare },
                      { label: 'Customer Cases', page: 'cases' as NavigationPage, icon: MessageSquare, badge: openCasesCount > 0 ? `${openCasesCount}` : undefined },
                      { label: 'Compliance & AML', page: 'compliance' as NavigationPage, icon: ShieldCheck },
                    ].map((item) => (
                      <button
                        key={item.page}
                        id={`glass-nav-risk-${item.page}`}
                        type="button"
                        onClick={() => onNavigate(item.page)}
                        className={cn(
                          'relative w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-semibold transition-all duration-200',
                          currentPage === item.page ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                        )}
                      >
                        {currentPage === item.page && <span className="absolute -left-[13px] h-4 w-[3px] rounded-full bg-blue-600" />}
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {'badge' in item && item.badge && (
                          <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5 leading-none">{item.badge}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Reports & Analytics Group ── */}
                <button
                  id="glass-nav-analytics"
                  type="button"
                  onClick={() =>
                    sidebarCollapsed ? onNavigate('performance') : setAnalyticsMenuOpen(!analyticsMenuOpen)
                  }
                  aria-expanded={!sidebarCollapsed && analyticsMenuOpen}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200 mt-2',
                    sidebarCollapsed ? 'h-11 w-11 mx-auto justify-center' : 'w-full px-3.5 py-3',
                    isAnalyticsPage ? sidebarCollapsed ? ACTIVE_TILE : analyticsMenuOpen ? ACTIVE_PARENT : ACTIVE_ROW : IDLE_ROW
                  )}
                  title="Reports & Analytics"
                >
                  {isAnalyticsPage && !sidebarCollapsed && !analyticsMenuOpen && <span className={ACTIVE_BAR} />}
                  <BarChart3 className={navIcon(isAnalyticsPage)} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">Reports & Analytics</span>
                      <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 transition-transform', !analyticsMenuOpen && '-rotate-90')} />
                    </>
                  )}
                </button>

                {!sidebarCollapsed && analyticsMenuOpen && (
                  <div className="ml-5.5 space-y-1 border-l border-slate-200/80 pl-3">
                    {[
                      { label: 'SR Performance', page: 'performance' as NavigationPage, icon: Award },
                      { label: 'Management Reports', page: 'reports' as NavigationPage, icon: BarChart3 },
                      { label: 'Customer Report', page: 'customer-report' as NavigationPage, icon: Users },
                    ].map((item) => (
                      <button
                        key={item.page}
                        id={`glass-nav-analytics-${item.page}`}
                        type="button"
                        onClick={() => onNavigate(item.page)}
                        className={cn(
                          'relative w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-semibold transition-all duration-200',
                          currentPage === item.page ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                        )}
                      >
                        {currentPage === item.page && <span className="absolute -left-[13px] h-4 w-[3px] rounded-full bg-blue-600" />}
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}


                {/* ── Settings Group ── */}
                <button
                  id="glass-nav-settings"
                  type="button"
                  onClick={() =>
                    sidebarCollapsed ? onNavigate('master-data') : setSettingsMenuOpen(!settingsMenuOpen)
                  }
                  aria-expanded={!sidebarCollapsed && settingsMenuOpen}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200 mt-2',
                    sidebarCollapsed ? 'h-11 w-11 mx-auto justify-center' : 'w-full px-3.5 py-3',
                    isSettingsPage ? sidebarCollapsed ? ACTIVE_TILE : settingsMenuOpen ? ACTIVE_PARENT : ACTIVE_ROW : IDLE_ROW
                  )}
                  title="Settings"
                >
                  {isSettingsPage && !sidebarCollapsed && !settingsMenuOpen && <span className={ACTIVE_BAR} />}
                  <Settings className={navIcon(isSettingsPage)} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">Settings</span>
                      <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 transition-transform', !settingsMenuOpen && '-rotate-90')} />
                    </>
                  )}
                </button>

                {!sidebarCollapsed && settingsMenuOpen && (
                  <div className="ml-5.5 space-y-1 border-l border-slate-200/80 pl-3">
                    {[
                      { label: 'Master Data', page: 'master-data' as NavigationPage, icon: Settings },
                    ].map((item) => (
                      <button
                        key={item.page}
                        id={`glass-nav-settings-${item.page}`}
                        type="button"
                        onClick={() => onNavigate(item.page)}
                        className={cn(
                          'relative w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-semibold transition-all duration-200',
                          currentPage === item.page ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                        )}
                      >
                        {currentPage === item.page && <span className="absolute -left-[13px] h-4 w-[3px] rounded-full bg-blue-600" />}
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* <div>
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
            </div> */}
          </nav>


        </aside>

        {/* Content Island Deck — only this column scrolls */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-5">
          {/* =========================================================================
              GLASSMORPHISM HEADER: Floating Translucent Pill Header
             ========================================================================= */}
          <header
            id="glassmorphism-header"
            className="relative z-40 bg-white/80 backdrop-blur-2xl border border-white/90 shadow-lg shadow-slate-300/30 rounded-2xl px-4 sm:px-6 py-3 mr-[calc(0.75rem_+_var(--sbw,0px))] sm:mr-[calc(1.25rem_+_var(--sbw,0px))] flex items-center justify-between gap-4 shrink-0"
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

              {/* Global Search trigger */}
              {onOpenSearch && (
                <button
                  id="glass-global-search-btn"
                  type="button"
                  onClick={onOpenSearch}
                  className="hidden sm:flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 text-xs font-medium transition border border-slate-200/50 w-48 lg:w-64"
                  title="Search (⌘K)"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Search...</span>
                  </div>
                  <kbd className="hidden lg:inline px-1.5 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-400 border border-slate-200">⌘K</kbd>
                </button>
              )}
            </div>

            {/* Right: Search (mobile) + Role + Notifications + Profile */}
            <div className="flex items-center gap-2">
              {/* Mobile search icon */}
              {onOpenSearch && (
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="sm:hidden p-2 rounded-xl bg-white/70 border border-white/80 text-slate-600 hover:bg-white shadow-xs transition"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              <NotificationBell
                notifications={notifications}
                onMarkRead={onMarkNotificationRead}
                onMarkAllRead={onMarkAllNotificationsRead}
                onNavigate={onNavigate}
              />
              <HeaderActions
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
                currentApp={currentApp}
                onAppChange={onAppChange}
              />
            </div>
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
