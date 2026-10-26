/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileEdit,
  Activity,
  Sparkles,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  RotateCcw,
  PlusCircle,
  FolderOpen,
  Stethoscope,
  Info,
} from 'lucide-react';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

export type NavigationTab =
  | 'dashboard'
  | 'caseStudio'
  | 'fractureExplorer'
  | 'aiReview'
  | 'reportStudio';

interface Props {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  caseTitle: string;
  caseId: string;
  onLoadDemoCase: () => void;
  onNewCase: () => void;
  children: React.ReactNode;
}

export const Shell: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  caseTitle,
  caseId,
  onLoadDemoCase,
  onNewCase,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'caseStudio' as NavigationTab,
      label: 'Case Studio',
      icon: FileEdit,
      badge: 'Invoer',
    },
    {
      id: 'fractureExplorer' as NavigationTab,
      label: 'Fracture Explorer',
      icon: Activity,
      badge: 'Anatomie',
    },
    {
      id: 'aiReview' as NavigationTab,
      label: 'AI Case Review',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      id: 'reportStudio' as NavigationTab,
      label: 'Report Studio',
      icon: FileCheck,
      badge: 'PDF',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Persistent Topmost Safety Strip */}
      <div className="bg-amber-950/80 border-b border-amber-600/50 text-amber-200 px-4 py-1.5 flex items-center justify-between text-xs font-semibold tracking-wide print:hidden">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="uppercase tracking-wider text-[11px]">
            DEMONSTRATIEPROTOTYPE — NIET VOOR KLINISCHE BESLUITVORMING
          </span>
        </div>
        <span className="text-[11px] text-amber-300/80 hidden md:inline">
          Educatieve demonstratie voor orthopedische chirurgen &amp; stafoverleg
        </span>
      </div>

      {/* Main Top Header Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm print:hidden">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-500/50 flex items-center justify-center text-teal-400 group-hover:scale-105 transition shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-teal-300 transition">
                  RadiusHead <span className="text-teal-400">AI</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-800/80 uppercase">
                  Demo
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Orthopedic Radial Head Fracture Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Center: Active Case Context */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-950/70 rounded-lg border border-slate-800 max-w-md truncate">
          <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
            {caseId}
          </span>
          <span className="text-xs text-slate-300 truncate font-medium">{caseTitle}</span>
        </div>

        {/* Right: Quick Case Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onLoadDemoCase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-300 bg-teal-950/70 hover:bg-teal-900/80 border border-teal-600/40 transition cursor-pointer"
            title="Herstel de voorgeconfigureerde voorbeeldcasus RH-001"
          >
            <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Voorbeeldcasus laden</span>
            <span className="sm:hidden">Voorbeeld</span>
          </button>

          <button
            onClick={onNewCase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title="Start een blanco nieuwe casus"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Nieuwe casus</span>
            <span className="sm:hidden">Nieuw</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation (Desktop) */}
        <aside
          className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between hidden lg:flex print:hidden shrink-0 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Navigation Items */}
          <div className="p-3 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
              {!sidebarCollapsed && <span>Navigatiemenu</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition ml-auto"
                title={sidebarCollapsed ? 'Klap zijbalk uit' : 'Klap zijbalk in'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge && !isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Notice */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-[11px]">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Geheugen &amp; Veiligheid</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Casusgegevens worden niet opgeslagen in externe databases en blijven in het lokale
                sessiegeheugen.
              </p>
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-2 z-50 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    RadiusHead AI
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                        isActive
                          ? 'bg-teal-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                DEMONSTRATIEPROTOTYPE — NIET VOOR KLINISCHE BESLUITVORMING
              </div>
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
