/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, Info, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

interface Props {
  compact?: boolean;
  className?: string;
}

export const MedicalDisclaimer: React.FC<Props> = ({ compact = false, className = '' }) => {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div
        className={`bg-amber-950/40 border border-amber-600/50 text-amber-200 px-3 py-1.5 rounded flex items-center justify-between text-xs font-medium tracking-wide ${className}`}
        role="alert"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            DEMONSTRATIEPROTOTYPE — NIET VOOR KLINISCHE BESLUITVORMING
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-amber-300 hover:text-amber-100 flex items-center gap-1 text-[11px] underline underline-offset-2 ml-2"
          aria-expanded={expanded}
          aria-label="Toon veiligheidsdetails"
        >
          {expanded ? 'Minder' : 'Veiligheidsinformatie'}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {expanded && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-6 max-w-lg w-full text-slate-200 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-400 mb-3">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">Veiligheids- en Gebruiksvoorwaarden</h3>
              </div>
              <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                RadiusHead AI is een <strong>educatief en demonstratief prototype</strong> voor
                orthopedische conferenties. Het systeem is nadrukkelijk <em>niet</em> gevalideerd als
                medisch hulpmiddel volgens de MDR (Medical Device Regulation) en beschikt niet over een
                CE-markering.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5 mb-4 leading-relaxed">
                <li>Uitsluitend te gebruiken met geanonimiseerde of fictieve casusdata.</li>
                <li>Het systeem stelt geen autonome diagnoses en verstrekt geen behandeladviezen.</li>
                <li>AI-suggesties vereisen te allen tijde verificatie door een gekwalificeerd medisch specialist.</li>
                <li>Geen opslag van patiëntgegevens of beeldmateriaal in persistente databases.</li>
              </ul>
              <button
                onClick={() => setExpanded(false)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded-lg text-sm transition"
              >
                Sluiten en begrepen
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-slate-900/90 border-l-4 border-amber-500 border-y border-r border-slate-800 rounded-r-lg p-4 text-slate-200 ${className}`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300 tracking-wide uppercase">
              DEMONSTRATIEPROTOTYPE — NIET VOOR KLINISCHE BESLUITVORMING
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Dit interactieve systeem is uitsluitend ontworpen als technologische demonstratie voor
              orthopedisch chirurgen en opleiders. Het maakt geen autonome diagnostische of therapeutische
              keuzes en gebruikt uitsluitend fictieve casusdata.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 shrink-0 px-2 py-1 bg-slate-800/80 rounded border border-slate-700"
          aria-expanded={expanded}
        >
          <Info className="w-3.5 h-3.5" />
          <span>{expanded ? 'Verberg details' : 'MDR & Veiligheid'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1.5 pl-8">
          <p>
            • <strong>Geen CE-keurmerk of MDR-conformiteit:</strong> Niet gecertificeerd voor patiëntenzorg.
          </p>
          <p>
            • <strong>Menselijke controle vereist:</strong> Alle AI-gegeneerde classificaties en interpretaties zijn suggesties en moeten door een orthopedisch specialist worden geverifieerd.
          </p>
          <p>
            • <strong>Geen persistente gegevensopslag:</strong> Geüploade demobeelden en ingevoerde casusteksten blijven enkel in het werkgeheugen van de browser.
          </p>
        </div>
      )}
    </div>
  );
};
