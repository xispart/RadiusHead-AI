/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  ExternalLink,
  MessageSquare,
  BookmarkCheck,
  Scale,
} from 'lucide-react';
import { Case, ClinicianReview } from '../../types/ortho';
import {
  getClinicalTreatmentGuideline,
  getMatchingMasonType,
  MASON_TYPES,
  CLINICAL_TREATMENT_GUIDELINES,
} from '../../utils/orthoRules';

interface Props {
  activeCase: Case;
  onUpdateCase: (updatedCase: Case) => void;
}

export const ClinicalTreatmentGuidelines: React.FC<Props> = ({
  activeCase,
  onUpdateCase,
}) => {
  const activeClassification = activeCase.fractureFeatures.classificationValue;
  const activeMasonDef = getMatchingMasonType(activeClassification);
  const initialKey = activeMasonDef?.typeKey || 'type_3';

  // State to allow surgeon to switch between Mason type tabs to compare guidelines
  const [selectedTypeKey, setSelectedTypeKey] = useState<string>(initialKey);
  const [specialistNote, setSpecialistNote] = useState<string>(() => {
    const existing = (activeCase.clinicianReview || []).find(
      (r) => r.itemId === 'treatment_recommendation'
    );
    return existing?.note || '';
  });
  const [discussionStatus, setDiscussionStatus] = useState<string>(() => {
    const existing = (activeCase.clinicianReview || []).find(
      (r) => r.itemId === 'treatment_recommendation'
    );
    return existing?.status === 'beoordeeld' ? 'besproken' : 'in_beraad';
  });
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync selectedTypeKey if the activeCase classification changes externally
  React.useEffect(() => {
    if (activeMasonDef?.typeKey) {
      setSelectedTypeKey(activeMasonDef.typeKey);
    }
  }, [activeClassification]);

  const currentGuideline =
    CLINICAL_TREATMENT_GUIDELINES[selectedTypeKey] || CLINICAL_TREATMENT_GUIDELINES.type_3;

  const handleSaveTreatmentConsideration = () => {
    const reviews = [...(activeCase.clinicianReview || [])];
    const existingIndex = reviews.findIndex((r) => r.itemId === 'treatment_recommendation');

    const treatmentReviewItem: ClinicianReview = {
      itemId: 'treatment_recommendation',
      itemType: 'summary',
      status: discussionStatus === 'besproken' ? 'beoordeeld' : 'aangepast',
      originalText: `Richtlijnkader: ${currentGuideline.strategyTitle} (${currentGuideline.masonTitle})`,
      editedText: `Specialistenconclusie staf: ${specialistNote || 'Conform richtlijn besproken'}`,
      note: specialistNote,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      reviews[existingIndex] = treatmentReviewItem;
    } else {
      reviews.push(treatmentReviewItem);
    }

    onUpdateCase({
      ...activeCase,
      clinicianReview: reviews,
    });

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const getSuitabilityBadge = (suitability: string) => {
    switch (suitability) {
      case 'Eerste keus':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-700">
            Eerste Keus
          </span>
        );
      case 'Bij specifieke criteria':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
            Bij Specifieke Criteria
          </span>
        );
      case 'Gecontra-indiceerd bij instabiliteit':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
            Gecontra-indiceerd bij Instabiliteit
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-teal-950 border border-teal-600/40 text-teal-300 uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Evidence-Based Richtlijnen</span>
            </span>
            <span className="text-xs text-slate-400">AO Trauma / NVT / Hotchkiss</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Klinische Behandeloverwegingen op basis van Mason-Classificatie
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Onderbouwd overzicht van behandelmodaliteiten, indicatiecriteria en literatuurevidentie voor stafoverleg.
          </p>
        </div>

        {/* Active Case Match Pill */}
        <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px]">Casus Classificatie:</span>
          <span className="font-bold text-teal-300 font-mono">
            {activeClassification || 'Niet beoordeeld'}
          </span>
        </div>
      </div>

      {/* Mason Type Tabs (surgoen can compare guidelines across types) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
        {MASON_TYPES.map((typeDef) => {
          const isSelected = selectedTypeKey === typeDef.typeKey;
          const isActiveCaseMatch = activeMasonDef?.typeKey === typeDef.typeKey;

          return (
            <button
              key={typeDef.typeKey}
              onClick={() => setSelectedTypeKey(typeDef.typeKey)}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{typeDef.shortLabel}</span>
              {isActiveCaseMatch && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'bg-teal-950 text-teal-200 border border-teal-400/40'
                      : 'bg-slate-800 text-teal-400 border border-slate-700'
                  }`}
                >
                  Actief
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Core Guideline Banner */}
      <div className="p-4 bg-gradient-to-r from-teal-950/40 via-slate-950 to-slate-950 border border-teal-500/30 rounded-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <span>{currentGuideline.strategyTitle}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {currentGuideline.masonTitle}
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          {currentGuideline.summary}
        </p>
      </div>

      {/* Grid: 2 Columns (Modalities vs Decision Criteria & Evidence) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Recommendations / Modalities (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Behandelopties &amp; Evidentieniveau</span>
          </h4>

          <div className="space-y-3">
            {currentGuideline.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-white text-xs">
                    {rec.modality}
                  </span>
                  <div className="flex items-center gap-2">
                    {getSuitabilityBadge(rec.suitability)}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rec.levelOfEvidence}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>

          {/* Rehabilitation Protocol Summary */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider text-teal-400">
              Geadviseerd Oefen- &amp; Revalidatieprotocol:
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {currentGuideline.rehabilitationProtocol}
            </p>
          </div>
        </div>

        {/* Right Column: Decision Factors, Citations & Specialist Note (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Critical Decision Factors Checklist */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Beslissende Indicatiecriteria:</span>
            </span>

            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4 leading-snug">
              {currentGuideline.criticalDecisionFactors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>

          {/* Evidence Literature Citations */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
              <span>Wetenschappelijke Referenties:</span>
            </span>

            <div className="space-y-2 text-[11px]">
              {currentGuideline.evidenceCitations.map((cit, idx) => (
                <div key={idx} className="pb-1.5 border-b border-slate-900 last:border-none last:pb-0">
                  <div className="font-semibold text-slate-200">
                    {cit.author} ({cit.year})
                  </div>
                  <div className="text-slate-400 italic text-[10px]">
                    &ldquo;{cit.title}&rdquo; — {cit.journal}
                  </div>
                  <div className="text-teal-300/90 text-[10px] mt-0.5">
                    Kernconclusie: {cit.takeaway}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialist Case Discussion Signoff */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Specialistenconclusie / Stafbespreking</span>
              </span>
              <select
                value={discussionStatus}
                onChange={(e) => setDiscussionStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] rounded px-2 py-0.5 focus:outline-none focus:border-teal-500"
              >
                <option value="in_beraad">In beraad</option>
                <option value="besproken">Besproken in staf</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={specialistNote}
              onChange={(e) => setSpecialistNote(e.target.value)}
              placeholder="Noteer de behandeloverweging voor deze specifieke casus (bijv. 'Gezien comminutie en >3mm step-off primaire radiuskopartroplastiek (RHP) gepland na 3D-CT verificatie')..."
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-[11px] focus:outline-none focus:border-teal-500"
            />

            <div className="flex items-center justify-between pt-1">
              {savedFeedback ? (
                <span className="text-[11px] text-teal-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Conclusie opgeslagen in casus</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">
                  Slaat overweging op in het casusrapport.
                </span>
              )}

              <button
                onClick={handleSaveTreatmentConsideration}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
              >
                Opslaan in casus
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-amber-950/30 border border-amber-600/30 rounded-lg text-[11px] text-amber-200/90 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Educatieve Waarschuwing:</strong> Deze behandeloverwegingen zijn gebaseerd op
          internationale traumachirurgische richtlijnen (AO Trauma / NVT / Hotchkiss) en dienen ter
          ondersteuning van stafbespreking en onderwijs. De uiteindelijke indicatiestelling voor operatie
          of conservatief beleid berust te allen tijde bij de behandelend medisch specialist.
        </p>
      </div>
    </div>
  );
};
