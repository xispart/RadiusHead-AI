/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  FolderOpen,
  PlusCircle,
  FileText,
  Activity,
  CheckCircle,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Case } from '../../types/ortho';

interface Props {
  activeCase: Case;
  onLoadDemoCase: () => void;
  onNewCase: () => void;
  onNavigateTab: (tab: 'dashboard' | 'caseStudio' | 'fractureExplorer' | 'aiReview' | 'reportStudio') => void;
}

export const Dashboard: React.FC<Props> = ({
  activeCase,
  onLoadDemoCase,
  onNewCase,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-950/80 border border-teal-500/30 text-teal-300">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Orthopedische Conferentiedemonstratie</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welkom bij <span className="text-teal-400">RadiusHead AI</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Interactief AI-ondersteuningsplatform voor elleboog- en traumachirurgen. Ontdek hoe
            kunstmatige intelligentie fractuurkenmerken kan structureren, ontbrekende klinische
            informatie signaleert en expertbesprekingen bij radiuskopfracturen faciliteert.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onLoadDemoCase}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Open voorbeeldcasus (RH-001)</span>
            </button>

            <button
              onClick={onNewCase}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-400" />
              <span>Nieuwe casus starten</span>
            </button>

            <button
              onClick={() => onNavigateTab('fractureExplorer')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-teal-400 hover:text-teal-300 text-xs sm:text-sm font-medium transition"
            >
              <span>Verken anatomie</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Case Summary Card & Workflow Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Case Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Actieve Casus
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-teal-300 border border-slate-700 uppercase">
              {activeCase.status}
            </span>
          </div>

          <div>
            <span className="text-xs font-mono text-teal-400">{activeCase.id}</span>
            <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
              {activeCase.title}
            </h3>
            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
              {activeCase.clinicalContext.notes || activeCase.clinicalContext.injuryMechanism || 'Geen aanvullende toelichting ingevoerd.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[11px]">Zijde:</span>
              <span className="text-slate-200 font-semibold capitalize">
                {activeCase.clinicalContext.side}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Leeftijdsgroep:</span>
              <span className="text-slate-200 font-semibold">
                {activeCase.clinicalContext.ageBand || 'Onbekend'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Classificatie:</span>
              <span className="text-teal-400 font-bold">
                {activeCase.fractureFeatures.classificationValue}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Verplaatsing:</span>
              <span className="text-slate-200 font-semibold">
                {activeCase.fractureFeatures.measuredDisplacementMm
                  ? `${activeCase.fractureFeatures.measuredDisplacementMm} mm`
                  : activeCase.fractureFeatures.displacement}
              </span>
            </div>
          </div>

          {/* Direct Link to Case Studio & AI Review */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => onNavigateTab('caseStudio')}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold text-center border border-slate-700 transition"
            >
              Bewerk casus
            </button>
            <button
              onClick={() => onNavigateTab('aiReview')}
              className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold text-center shadow-sm transition"
            >
              Bekijk AI-analyse
            </button>
          </div>
        </div>

        {/* 4-Step Clinical Workflow Overview (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Casus Workflow (4 Stappen)
            </h3>
            <span className="text-xs text-slate-400">Verloop van binnenkomst tot stafoverleg</span>
          </div>

          <div className="space-y-3">
            {[
              {
                step: '1',
                title: 'Casus & Beeldvorming (Case Studio)',
                desc: 'Anonieme invoer van traumamechanisme, tijdsverloop, optionele röntgenfoto en handmatige metingen.',
                tab: 'caseStudio' as const,
                icon: FileText,
                done: Boolean(activeCase.title),
              },
              {
                step: '2',
                title: 'Morfologie & Anatomie (Fracture Explorer)',
                desc: 'Interactieve schematische weergave van het caput radii, fragmentatiegraad en gewrichtsstep-off.',
                tab: 'fractureExplorer' as const,
                icon: Activity,
                done: true,
              },
              {
                step: '3',
                title: 'Gestructureerd AI-Overzicht (AI Review)',
                desc: 'Scheiding van harde feiten en AI-hypotheses, identificatie van ontbrekende diagnostiek en curatie.',
                tab: 'aiReview' as const,
                icon: Sparkles,
                done: Boolean(activeCase.aiReview),
              },
              {
                step: '4',
                title: 'Printbaar Casusrapport (Report Studio)',
                desc: 'Volledig verslag voor ochtendrapport of stafbespreking met behoud van specialistenparaaf.',
                tab: 'reportStudio' as const,
                icon: CheckCircle,
                done: Boolean(activeCase.aiReview),
              },
            ].map((item) => (
              <div
                key={item.step}
                onClick={() => onNavigateTab(item.tab)}
                className="p-3.5 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-500/40 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-teal-300 transition">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 shrink-0 transition" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety & Demonstration Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-1.5">
          <span className="font-bold text-teal-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Geen Zelfstandige Diagnose</span>
          </span>
          <p className="text-slate-400 leading-relaxed">
            De AI stelt geen bindende diagnose en dicteert geen implantaten. Alle suggesties dienen als voorzet voor menselijke verificatie.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-1.5">
          <span className="font-bold text-teal-400 flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>Feit vs. Interpretatie</span>
          </span>
          <p className="text-slate-400 leading-relaxed">
            Door de arts ingevoerde parameters blijven strikt gescheiden van hypothetische correlaties en AI-modellen.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-1.5">
          <span className="font-bold text-teal-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>Privacy & Vluchtig Geheugen</span>
          </span>
          <p className="text-slate-400 leading-relaxed">
            Alle casusinformatie leeft in het browsergeheugen van deze sessie. Geen persistente opslag in externe databases.
          </p>
        </div>
      </div>
    </div>
  );
};
