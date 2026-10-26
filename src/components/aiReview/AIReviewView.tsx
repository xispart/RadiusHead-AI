/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  FileText,
  Edit3,
  XCircle,
  MessageSquare,
  ShieldAlert,
  Save,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  Case,
  AIReview,
  ClinicianReview,
  ReviewItemStatus,
  ProvidedFact,
  ModelInterpretation,
  MissingInformationItem,
  ReviewQuestion,
} from '../../types/ortho';
import {
  getStatusLabel,
  getCategoryLabel,
  mergeOrRetainClinicianReviews,
  createDefaultClinicianReviews,
} from '../../utils/orthoRules';
import { requestLiveAIReview, getDeterministicSampleReview } from '../../services/aiService';

interface Props {
  activeCase: Case;
  onUpdateCase: (updatedCase: Case) => void;
  onNavigateToReport: () => void;
}

export const AIReviewView: React.FC<Props> = ({
  activeCase,
  onUpdateCase,
  onNavigateToReport,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRerunModal, setShowRerunModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    text: string;
    note: string;
  } | null>(null);

  const aiReview = activeCase.aiReview;
  const clinicianReviews = activeCase.clinicianReview || [];

  const getReviewState = (itemId: string): ClinicianReview | undefined => {
    return clinicianReviews.find((r) => r.itemId === itemId);
  };

  const handleUpdateItemStatus = (itemId: string, status: ReviewItemStatus) => {
    const updated = clinicianReviews.map((r) => {
      if (r.itemId === itemId) {
        return { ...r, status, updatedAt: new Date().toISOString() };
      }
      return r;
    });
    onUpdateCase({ ...activeCase, clinicianReview: updated });
  };

  const handleSaveItemEdit = () => {
    if (!editingItem) return;

    const updated = clinicianReviews.map((r) => {
      if (r.itemId === editingItem.id) {
        return {
          ...r,
          editedText: editingItem.text,
          note: editingItem.note,
          status: 'aangepast' as ReviewItemStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    onUpdateCase({ ...activeCase, clinicianReview: updated });
    setEditingItem(null);
  };

  const executeAIReview = async (retainPreviousEdits: boolean) => {
    setLoading(true);
    setErrorMessage(null);

    const result = await requestLiveAIReview(
      activeCase,
      activeCase.imagingInput.imageDataUrl,
      'image/png'
    );

    setLoading(false);

    if (result.success && result.review) {
      const mergedClinician = mergeOrRetainClinicianReviews(
        activeCase.clinicianReview,
        result.review,
        retainPreviousEdits
      );

      onUpdateCase({
        ...activeCase,
        status: 'beoordeeld',
        aiReview: result.review,
        clinicianReview: mergedClinician,
        reportVersion: activeCase.reportVersion + 1,
      });
    } else {
      setErrorMessage(
        result.error || 'Er is een fout opgetreden bij het uitvoeren van de AI-analyse.'
      );
    }
  };

  const handleTriggerAI = () => {
    // Check if user has existing custom edits
    const hasEdits = clinicianReviews.some(
      (r) => r.status === 'aangepast' || r.status === 'afgewezen' || r.note.trim() !== ''
    );

    if (hasEdits) {
      setShowRerunModal(true);
    } else {
      executeAIReview(false);
    }
  };

  const handleLoadSampleReview = () => {
    const sample = getDeterministicSampleReview();
    const reviews = createDefaultClinicianReviews(sample);
    onUpdateCase({
      ...activeCase,
      status: 'beoordeeld',
      aiReview: sample,
      clinicianReview: reviews,
      reportVersion: activeCase.reportVersion + 1,
    });
    setErrorMessage(null);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'clinician_entered':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
            Door arts ingevoerd
          </span>
        );
      case 'uploaded_image':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
            Beeldwaarneming
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Overige casusinvoer
          </span>
        );
    }
  };

  const getInterpretationStatusBadge = (status: string) => {
    switch (status) {
      case 'suggestion':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-800">
            AI-suggestie (in beraad)
          </span>
        );
      case 'uncertain':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            Onzeker / Hypothese
          </span>
        );
      case 'not_assessable':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Niet beoordeelbaar
          </span>
        );
      default:
        return null;
    }
  };

  const renderStatusButton = (itemId: string) => {
    const state = getReviewState(itemId);
    const currentStatus = state?.status || 'niet_beoordeeld';

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => handleUpdateItemStatus(itemId, 'beoordeeld')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition ${
            currentStatus === 'beoordeeld'
              ? 'bg-teal-600 text-white font-semibold shadow-sm'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
          title="Markeer als geverifieerd door specialist"
        >
          <CheckCircle className="w-3 h-3 text-teal-300" />
          <span>Beoordeeld</span>
        </button>

        <button
          onClick={() => {
            const current = getReviewState(itemId);
            setEditingItem({
              id: itemId,
              text: current?.editedText || '',
              note: current?.note || '',
            });
          }}
          className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition ${
            currentStatus === 'aangepast'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
          title="Pas tekst aan of voeg notitie toe"
        >
          <Edit3 className="w-3 h-3 text-amber-300" />
          <span>Aanpassen</span>
        </button>

        <button
          onClick={() => handleUpdateItemStatus(itemId, 'afgewezen')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition ${
            currentStatus === 'afgewezen'
              ? 'bg-red-700 text-white font-semibold shadow-sm'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
          title="Wijs deze AI-hypothese af"
        >
          <XCircle className="w-3 h-3 text-red-300" />
          <span>Afwijzen</span>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-teal-950 border border-teal-600/40 text-teal-300 uppercase tracking-wider">
                AI Casusoverzicht
              </span>
              {aiReview && (
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                    aiReview.mode === 'live'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-indigo-950 text-indigo-300 border-indigo-700'
                  }`}
                >
                  {aiReview.mode === 'live' ? 'Live AI-analyse (Gemini)' : 'Voorbeeldresultaat (Lokaal)'}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              AI-Ondersteund Casusoverzicht & Review
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Gestructureerde analyse van feiten, AI-interpretaties, ontbrekende informatie en verificatievragen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTriggerAI}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyseren...' : 'Genereer AI-casusoverzicht'}</span>
            </button>

            <button
              onClick={handleLoadSampleReview}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
              title="Laad het vooraf gedefinieerde deterministische voorbeeld"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>Voorbeeldresultaat</span>
            </button>

            {aiReview && (
              <button
                onClick={onNavigateToReport}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold transition"
              >
                <span>Naar rapport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Error notification if live call fails */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-950/60 border border-red-700/60 rounded-lg text-xs text-red-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-300">AI-verzoek niet geslaagd:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-red-800/40">
              <button
                onClick={handleTriggerAI}
                className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-[11px] font-semibold"
              >
                Opnieuw proberen
              </button>
              <button
                onClick={handleLoadSampleReview}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
              >
                Lokaal voorbeeldoverzicht laden
              </button>
            </div>
          </div>
        )}
      </div>

      {/* When no review has been generated yet */}
      {!aiReview && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-4">
          <Sparkles className="w-12 h-12 mx-auto text-teal-500/60" />
          <h3 className="text-base font-bold text-white">Nog geen AI-overzicht gegenereerd</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Klik op &ldquo;Genereer AI-casusoverzicht&rdquo; om via Gemini een gestructureerde analyse uit te voeren, of laad direct het lokale voorbeeldresultaat.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleTriggerAI}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
            >
              Start live analyse
            </button>
            <button
              onClick={handleLoadSampleReview}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold"
            >
              Laad lokaal voorbeeld
            </button>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-300 space-y-4">
          <RefreshCw className="w-10 h-10 mx-auto text-teal-400 animate-spin" />
          <h3 className="text-sm font-bold text-white">Casusoverzicht wordt opgesteld...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Het model structureert ingevoerde feiten, toetst op ontbrekende klinische informatie en formuleert verificatievragen voor de specialist.
          </p>
        </div>
      )}

      {/* Review Content Cards */}
      {aiReview && !loading && (
        <div className="space-y-6">
          {/* Card 1: Casussamenvatting */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Casussamenvatting
                </h3>
              </div>
              {renderStatusButton('summary')}
            </div>

            {(() => {
              const summaryState = getReviewState('summary');
              const isEdited = summaryState?.status === 'aangepast';
              return (
                <div className="space-y-2">
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                    {summaryState?.editedText || aiReview.caseSummary}
                  </p>
                  {isEdited && (
                    <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded text-xs text-slate-400">
                      <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                        Oorspronkelijke AI-tekst:
                      </span>
                      <span className="line-through text-slate-400/80">{aiReview.caseSummary}</span>
                    </div>
                  )}
                  {summaryState?.note && (
                    <div className="p-2 bg-teal-950/40 border border-teal-800/50 rounded text-xs text-teal-300 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span>Specialistennotitie: {summaryState.note}</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Card 2: Ingediende Feiten */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Ingediende Feiten ({aiReview.providedFacts.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Door gebruiker verstrekt</span>
            </div>

            <div className="space-y-3">
              {aiReview.providedFacts.map((fact: ProvidedFact) => {
                const state = getReviewState(fact.id);
                const isEdited = state?.status === 'aangepast';

                return (
                  <div
                    key={fact.id}
                    className={`p-3.5 rounded-lg border transition ${
                      state?.status === 'afgewezen'
                        ? 'bg-red-950/20 border-red-900/50 opacity-60'
                        : state?.status === 'beoordeeld'
                        ? 'bg-slate-950 border-teal-800/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {getSourceBadge(fact.source)}
                        <span className="text-[10px] text-slate-500 font-mono">{fact.id}</span>
                      </div>
                      {renderStatusButton(fact.id)}
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {state?.editedText || fact.text}
                    </p>

                    {isEdited && (
                      <div className="mt-2 text-[11px] text-slate-400">
                        <span className="text-slate-500">Origineel: </span>
                        <span className="line-through">{fact.text}</span>
                      </div>
                    )}
                    {state?.note && (
                      <div className="mt-2 text-[11px] text-teal-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>Notitie: {state.note}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Modelinterpretaties & AI-hypotheses */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3. Modelinterpretaties & Hypotheses ({aiReview.modelInterpretations.length})
                </h3>
              </div>
              <span className="text-[11px] text-amber-400 font-medium">Vereist specialistencontrole</span>
            </div>

            <div className="space-y-3">
              {aiReview.modelInterpretations.map((interp: ModelInterpretation) => {
                const state = getReviewState(interp.id);
                const isEdited = state?.status === 'aangepast';

                return (
                  <div
                    key={interp.id}
                    className={`p-3.5 rounded-lg border transition ${
                      state?.status === 'afgewezen'
                        ? 'bg-red-950/20 border-red-900/50 opacity-60'
                        : state?.status === 'beoordeeld'
                        ? 'bg-slate-950 border-teal-800/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getInterpretationStatusBadge(interp.status)}
                        <span className="text-[10px] text-slate-500 font-mono">{interp.id}</span>
                      </div>
                      {renderStatusButton(interp.id)}
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {state?.editedText || interp.text}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <span className="text-slate-500 font-semibold">Grondslag/Basis: </span>
                      <span>{interp.basis}</span>
                    </div>

                    {isEdited && (
                      <div className="mt-2 text-[11px] text-slate-400">
                        <span className="text-slate-500">Origineel: </span>
                        <span className="line-through">{interp.text}</span>
                      </div>
                    )}
                    {state?.note && (
                      <div className="mt-2 text-[11px] text-teal-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>Notitie: {state.note}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Ontbrekende Informatie */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  4. Ontbrekende Informatie ({aiReview.missingInformation.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Klinische leemtes</span>
            </div>

            <div className="space-y-3">
              {aiReview.missingInformation.map((missing: MissingInformationItem) => {
                const state = getReviewState(missing.id);
                return (
                  <div
                    key={missing.id}
                    className={`p-3.5 rounded-lg border transition ${
                      state?.status === 'afgewezen'
                        ? 'bg-red-950/20 border-red-900/50 opacity-60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                        Ontbrekend Gegeven
                      </span>
                      {renderStatusButton(missing.id)}
                    </div>

                    <p className="text-xs text-slate-200 font-medium">
                      {state?.editedText || missing.question}
                    </p>

                    <div className="mt-2 text-[11px] text-slate-400">
                      <span className="text-slate-500 font-semibold">Klinische relevantie: </span>
                      <span>{missing.reason}</span>
                    </div>

                    {state?.note && (
                      <div className="mt-2 text-[11px] text-teal-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>Notitie: {state.note}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 5: Beoordelingsvragen voor Specialist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  5. Verificatie- en Beoordelingsvragen ({aiReview.reviewQuestions.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Expert discussiepunten</span>
            </div>

            <div className="space-y-3">
              {aiReview.reviewQuestions.map((q: ReviewQuestion) => {
                const state = getReviewState(q.id);
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-lg border transition ${
                      state?.status === 'afgewezen'
                        ? 'bg-red-950/20 border-red-900/50 opacity-60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-teal-300 border border-slate-700">
                        {getCategoryLabel(q.category)}
                      </span>
                      {renderStatusButton(q.id)}
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {state?.editedText || q.question}
                    </p>

                    {state?.note && (
                      <div className="mt-2 text-[11px] text-teal-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>Notitie: {state.note}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 6: Onzekerheden, Beperkingen & Veiligheidsdisclaimer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                6. Onzekerheden, Beperkingen & Veiligheidsdisclaimer
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="font-semibold text-amber-300 block mb-2">
                  Geïdentificeerde onzekerheden:
                </span>
                <ul className="space-y-1 text-slate-400 list-disc pl-4 text-[11px]">
                  {aiReview.uncertainties.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-2">
                  Systeembeperkingen (V1 Prototype):
                </span>
                <ul className="space-y-1 text-slate-400 list-disc pl-4 text-[11px]">
                  {aiReview.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-lg text-xs text-amber-200/90 leading-relaxed">
              <strong>Officiële Disclaimer:</strong> {aiReview.disclaimer}
            </div>
          </div>
        </div>
      )}

      {/* Clinician Item Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-xl p-6 max-w-lg w-full text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-400" />
                <span>Tekst aanpassen & Specialistnotitie toevoegen</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Aangepaste tekst van dit onderdeel
                </label>
                <textarea
                  rows={4}
                  value={editingItem.text}
                  onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Specialistnotitie / Motivering (optioneel)
                </label>
                <input
                  type="text"
                  value={editingItem.note}
                  onChange={(e) => setEditingItem({ ...editingItem, note: e.target.value })}
                  placeholder="Bijv. Besproken in ochtendrapport; CT geïndiceerd."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveItemEdit}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
              >
                Wijzigingen opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rerun Confirmation Modal (Retain vs Replace edits) */}
      {showRerunModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-6 max-w-md w-full text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Bestaande beoordelingen aanwezig</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Je hebt reeds handmatige aanpassingen of notities gemaakt in dit casusoverzicht. Hoe wil je omgaan met je bestaande wijzigingen bij deze nieuwe AI-analyse?
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowRerunModal(false);
                  executeAIReview(true);
                }}
                className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold text-left flex items-center justify-between"
              >
                <span>Bestaande beoordelingen behouden</span>
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowRerunModal(false);
                  executeAIReview(false);
                }}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium text-left"
              >
                Volledig overschrijven met nieuwe analyse
              </button>
              <button
                onClick={() => setShowRerunModal(false)}
                className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-slate-200"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
