/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  ArrowLeft,
  Copy,
  Check,
  FileCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Case, ClinicianReview } from '../../types/ortho';
import { getCategoryLabel, getClinicalTreatmentGuideline } from '../../utils/orthoRules';

interface Props {
  activeCase: Case;
  onBackToCase: () => void;
}

export const ReportStudio: React.FC<Props> = ({ activeCase, onBackToCase }) => {
  const [copied, setCopied] = useState(false);

  const review = activeCase.aiReview;
  const clinicianMap = new Map<string, ClinicianReview>();
  (activeCase.clinicianReview || []).forEach((r) => clinicianMap.set(r.itemId, r));

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const textToCopy = `RADIUSHEAD AI — CASUSRAPPORT VOOR BESPREKING
Casus: ${activeCase.title} (ID: ${activeCase.id})
Status: ${activeCase.status} | Datum: ${new Date().toLocaleDateString('nl-NL')}
Zijde: ${activeCase.clinicalContext.side} | Leeftijdscat.: ${activeCase.clinicalContext.ageBand || 'Onbekend'}
Traumamechanisme: ${activeCase.clinicalContext.injuryMechanism || 'Geen'}

FRACTUURKENMERKEN:
- Fragmentatie: ${activeCase.fractureFeatures.fragmentation}
- Articulair: ${activeCase.fractureFeatures.articularInvolvement}
- Verplaatsing: ${activeCase.fractureFeatures.displacement} (${activeCase.fractureFeatures.measuredDisplacementMm ? `${activeCase.fractureFeatures.measuredDisplacementMm} mm` : 'geen meting'})
- Stabiliteit: ${activeCase.fractureFeatures.stability}
- Mason classificatie: ${activeCase.fractureFeatures.classificationValue} (Bron: ${activeCase.fractureFeatures.classificationSource})

SAMENVATTING:
${review?.caseSummary || 'Geen AI-overzicht gegenereerd'}

LET OP: DEMONSTRATIEPROTOTYPE — NIET VOOR KLINISCHE BESLUITVORMING.`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar (hidden during print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToCase}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Terug naar casus"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">Rapport Studio</h2>
              <p className="text-xs text-slate-400">
                Print-klaar klinisch casusverslag voor stafbespreking en overdracht.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Gekopieerd!' : 'Kopieer tekst'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Afdrukken / Opslaan als PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Printable Medical Report Sheet */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-300 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto space-y-6 font-sans">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                <span>RadiusHead AI</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800 uppercase tracking-widest">
                  Casusrapport
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Orthopedische Morfologische Evaluatie & Gestructureerd Casusoverzicht
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <span className="block font-bold text-slate-900">Versie {activeCase.reportVersion}.0</span>
              <span className="block">Datum: {new Date().toLocaleDateString('nl-NL')}</span>
              <span className="block font-mono text-[11px] text-slate-500">ID: {activeCase.id}</span>
            </div>
          </div>

          {/* Prominent Mandatory Safety Banner */}
          <div className="mt-4 p-2.5 bg-amber-50 border-2 border-amber-500 text-amber-950 rounded text-center text-xs font-bold uppercase tracking-wider">
            DEMONSTRATIEPROTOTYPE — NIET VOOR KLINISCHE BESLUITVORMING
          </div>
        </div>

        {/* Section 1: Patient / Case Metadata */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 mb-2 border-b border-slate-300">
            1. Anonieme Casusgegevens
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Casustitel:</span>
              <span className="font-bold text-slate-900">{activeCase.title}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Zijde:</span>
              <span className="font-semibold text-slate-900 capitalize">{activeCase.clinicalContext.side}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Leeftijdscategorie:</span>
              <span className="font-semibold text-slate-900">{activeCase.clinicalContext.ageBand || 'Onbekend'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Tijd sinds trauma:</span>
              <span className="font-semibold text-slate-900">{activeCase.clinicalContext.timeSinceInjury || 'Niet gespecificeerd'}</span>
            </div>
          </div>
          {activeCase.clinicalContext.injuryMechanism && (
            <div className="mt-2 text-xs">
              <span className="text-slate-500 font-medium">Traumamechanisme: </span>
              <span className="text-slate-800">{activeCase.clinicalContext.injuryMechanism}</span>
            </div>
          )}
          {activeCase.clinicalContext.notes && (
            <div className="mt-1 text-xs">
              <span className="text-slate-500 font-medium">Klinische Notities: </span>
              <span className="text-slate-800">{activeCase.clinicalContext.notes}</span>
            </div>
          )}
        </div>

        {/* Section 2: Imaging Description */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 mb-2 border-b border-slate-300">
            2. Beeldvormingsstatus & Radiologie
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs mb-2">
            <div>
              <span className="text-slate-500 font-medium">Beschikbare Modaliteit: </span>
              <span className="font-semibold text-slate-900 uppercase">{activeCase.imagingInput.modality}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Bron van Gegevens: </span>
              <span className="font-semibold text-slate-900">{activeCase.imagingInput.sourceType}</span>
            </div>
          </div>
          {activeCase.imagingInput.observations && (
            <p className="text-xs text-slate-800 italic bg-slate-50 p-2.5 rounded border border-slate-200">
              {activeCase.imagingInput.observations}
            </p>
          )}
        </div>

        {/* Section 3: Clinician Entered Fracture Features */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 mb-2 border-b border-slate-300">
            3. Fractuurkenmerken & Geassocieerde Letsels
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Fragmentatie:</span>
              <span className="font-semibold text-slate-900 capitalize">{activeCase.fractureFeatures.fragmentation}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Gewrichtsoppervlak:</span>
              <span className="font-semibold text-slate-900 capitalize">{activeCase.fractureFeatures.articularInvolvement}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Verplaatsing:</span>
              <span className="font-semibold text-slate-900">
                {activeCase.fractureFeatures.displacement}{' '}
                {activeCase.fractureFeatures.measuredDisplacementMm ? `(${activeCase.fractureFeatures.measuredDisplacementMm} mm)` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Stabiliteit:</span>
              <span className="font-semibold text-slate-900 capitalize">{activeCase.fractureFeatures.stability}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Mason Classificatie:</span>
              <span className="font-bold text-teal-800">
                {activeCase.fractureFeatures.classificationValue}
              </span>{' '}
              <span className="text-[10px] text-slate-500">({activeCase.fractureFeatures.classificationSource})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Elleboogluxatie:</span>
              <span className="font-semibold text-slate-900 capitalize">{activeCase.associatedInjuries.dislocation}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Coronoidfractuur:</span>
              <span className="font-semibold text-slate-900 capitalize">{activeCase.associatedInjuries.coronoid}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Ligamentaire Verdenking:</span>
              <span className="font-semibold text-slate-900 capitalize">{activeCase.associatedInjuries.ligamentConcern}</span>
            </div>
          </div>
        </div>

        {/* Section 4: AI Case Review with Clinician Edits */}
        {review ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 mb-2 border-b border-slate-300">
                4. AI-Overzicht & Gestructureerde Analyse
              </h3>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-800 leading-relaxed">
                <span className="font-bold text-slate-950 block mb-1">Casussamenvatting:</span>
                {clinicianMap.get('summary')?.editedText || review.caseSummary}
                {clinicianMap.get('summary')?.note && (
                  <p className="mt-2 text-teal-800 font-medium">
                    Specialist notitie: {clinicianMap.get('summary')?.note}
                  </p>
                )}
              </div>
            </div>

            {/* Model Interpretations */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1.5">Modelinterpretaties & Status:</h4>
              <div className="space-y-1.5 text-xs">
                {review.modelInterpretations.map((interp) => {
                  const state = clinicianMap.get(interp.id);
                  return (
                    <div key={interp.id} className="p-2 border border-slate-200 rounded">
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span className="font-bold uppercase">{interp.status}</span>
                        <span className="italic">Reviewstatus: {state?.status || 'niet beoordeeld'}</span>
                      </div>
                      <p className="text-slate-900 font-medium">{state?.editedText || interp.text}</p>
                      <p className="text-[11px] text-slate-500">Basis: {interp.basis}</p>
                      {state?.note && <p className="text-[11px] text-teal-800 font-semibold mt-1">Notitie: {state.note}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missing Info */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1.5">Ontbrekende Informatie:</h4>
              <ul className="text-xs space-y-1 list-disc pl-5 text-slate-800">
                {review.missingInformation.map((m) => (
                  <li key={m.id}>
                    <strong>{m.question}</strong> — <span className="text-slate-600">{m.reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Review Questions */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1.5">Verificatievragen voor Bespreking:</h4>
              <div className="space-y-1 text-xs">
                {review.reviewQuestions.map((q) => (
                  <div key={q.id} className="text-slate-800">
                    <span className="font-semibold text-slate-950">[{getCategoryLabel(q.category)}]: </span>
                    <span>{q.question}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Uncertainties & Limitations */}
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <span className="font-bold block text-slate-800">Onzekerheden:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {review.uncertainties.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-bold block text-slate-800">Beperkingen van dit model:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {review.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 text-center text-xs text-slate-500 italic rounded">
            Nog geen AI-analyse uitgevoerd voor deze casus.
          </div>
        )}

        {/* Section 5: Evidence-based Behandelrichtlijnen & Stafafweging */}
        {(() => {
          const guideline = getClinicalTreatmentGuideline(activeCase.fractureFeatures.classificationValue);
          const treatmentReview = clinicianMap.get('treatment_recommendation');
          return (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 mb-2 border-b border-slate-300">
                5. Behandelrichtlijnen volgens Evidence ({guideline.masonTitle})
              </h3>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-2.5">
                <div>
                  <span className="font-bold text-slate-900 block">{guideline.strategyTitle}</span>
                  <p className="text-slate-800 leading-relaxed mt-0.5">{guideline.summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-1">Besluitvormingscriteria:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                      {guideline.criticalDecisionFactors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-1">Behandelmodaliteiten & Bewijskracht:</span>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {guideline.recommendations.map((mod, idx) => (
                        <li key={idx} className="border-l-2 border-teal-600 pl-2">
                          <span className="font-semibold text-slate-900">{mod.modality}</span>{' '}
                          <span className="text-[10px] text-slate-500 font-mono">[{mod.levelOfEvidence}]</span>
                          <span className="block text-slate-600">{mod.suitability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {treatmentReview?.note && (
                  <div className="mt-2 p-2.5 bg-teal-50/80 rounded border border-teal-200 text-xs">
                    <span className="font-bold text-teal-950 block">Conclusie / Afweging Stafbespreking:</span>
                    <p className="text-teal-900 italic mt-0.5">{treatmentReview.note}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Footer & Final Verification Signoff */}
        <div className="pt-6 border-t-2 border-slate-900 text-xs text-slate-600 space-y-2">
          <p className="leading-relaxed">
            <strong>Klinische Validatieverklaring:</strong> Dit rapport is tot stand gekomen via RadiusHead AI als demonstratieprototype. Het is <em>geen</em> gevalideerde diagnostische beoordeling of medisch hulpmiddel. Definitieve diagnostiek en behandelkeuzes (bijv. conservatief, schroeffixatie of radiuskopvervanging) blijven de exclusieve verantwoordelijkheid van de behandelend arts.
          </p>
          <div className="flex justify-between items-end pt-4">
            <span className="text-[10px] text-slate-400">Gegenereerd: {new Date().toISOString()}</span>
            <div className="border-t border-slate-400 w-48 text-center text-[11px] pt-1 text-slate-700">
              Handtekening / Paraaf Specialist
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
