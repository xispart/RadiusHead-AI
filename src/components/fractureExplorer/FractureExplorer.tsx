/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Eye,
  Layers,
  HelpCircle,
  Activity,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Check,
  ShieldCheck,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  FractureFeatures,
  AssociatedInjuries,
  ClassificationSource,
  FragmentationRating,
  FeaturePresence,
  StabilityRating,
  Case,
} from '../../types/ortho';
import {
  suggestMasonClassification,
  MASON_TYPES,
  getMatchingMasonType,
  MasonTypeDefinition,
  evaluateMasonTypeMatch,
  MasonTypeMatchResult,
} from '../../utils/orthoRules';

type ViewAngle = 'anterieur' | 'posterieur' | 'lateraal';

type AnatomicalFeatureKey =
  | 'radiuskop'
  | 'proximaal_radiusdeel'
  | 'gewrichtsoppervlak'
  | 'fractuurfragmenten'
  | 'verplaatsing';

interface Props {
  activeCase?: Case;
  onUpdateCase?: (updatedCase: Case) => void;
  fractureFeatures?: FractureFeatures;
  associatedInjuries?: AssociatedInjuries;
  onUpdateFeatures?: (updated: Partial<FractureFeatures>) => void;
  onUpdateCaseData?: (
    updatedFeatures: Partial<FractureFeatures>,
    updatedInjuries?: Partial<AssociatedInjuries>
  ) => void;
}

export const FractureExplorer: React.FC<Props> = ({
  activeCase,
  onUpdateCase,
  fractureFeatures: propFeatures,
  associatedInjuries: propInjuries,
  onUpdateFeatures,
  onUpdateCaseData,
}) => {
  const [activeView, setActiveView] = useState<ViewAngle>('anterieur');
  const [selectedFeature, setSelectedFeature] = useState<AnatomicalFeatureKey | null>(
    'fractuurfragmenten'
  );
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Resolve fracture features & injuries from activeCase if provided, otherwise from props/fallbacks
  const fractureFeatures: FractureFeatures =
    activeCase?.fractureFeatures ||
    propFeatures || {
      fragmentation: 'multiple',
      articularInvolvement: 'present',
      displacement: 'present',
      measuredDisplacementMm: 3.2,
      stability: 'uncertain',
      classificationValue: 'Type III (Communitief)',
      classificationSource: 'clinician-entered',
    };

  const associatedInjuries: AssociatedInjuries =
    activeCase?.associatedInjuries ||
    propInjuries || {
      dislocation: 'absent',
      coronoid: 'absent',
      ligamentConcern: 'absent',
      otherFindings: '',
    };

  // Sync simulated fragment count with current case fracture characteristics
  const simulatedFragmentCount =
    fractureFeatures.fragmentation === 'multiple'
      ? 3
      : fractureFeatures.fragmentation === 'limited'
      ? 2
      : 1;

  // Calculate algorithmic Mason recommendation from identified characteristics
  const recommendation = suggestMasonClassification(fractureFeatures, associatedInjuries);
  const activeMasonType = getMatchingMasonType(fractureFeatures.classificationValue);

  // Dynamic evaluation of all 4 Mason types based on current fracture features
  const evaluatedMasonTypes: MasonTypeMatchResult[] = MASON_TYPES.map((typeDef) =>
    evaluateMasonTypeMatch(typeDef, fractureFeatures, associatedInjuries, recommendation.suggestedType)
  );

  const showFeedback = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => {
      setStatusFeedback(null);
    }, 3500);
  };

  const handleApplyMasonType = (typeDef: MasonTypeDefinition, syncPresets = false) => {
    const updatedFeatures: Partial<FractureFeatures> = {
      classificationValue: typeDef.name,
      classificationSource: 'clinician-entered',
    };

    if (syncPresets) {
      Object.assign(updatedFeatures, typeDef.presetFeatures);
    }

    const updatedInjuries = syncPresets && typeDef.presetInjuries ? typeDef.presetInjuries : undefined;

    // 1. Update activeCase if parent provided onUpdateCase
    if (onUpdateCase && activeCase) {
      onUpdateCase({
        ...activeCase,
        fractureFeatures: {
          ...activeCase.fractureFeatures,
          ...updatedFeatures,
        },
        associatedInjuries: updatedInjuries
          ? {
              ...activeCase.associatedInjuries,
              ...updatedInjuries,
            }
          : activeCase.associatedInjuries,
      });
    }

    // 2. Delegate to onUpdateCaseData or onUpdateFeatures if available
    if (onUpdateCaseData) {
      onUpdateCaseData(updatedFeatures, updatedInjuries);
    } else if (onUpdateFeatures) {
      onUpdateFeatures(updatedFeatures);
    }

    showFeedback(
      syncPresets
        ? `Classificatie ${typeDef.shortLabel} geselecteerd en bijbehorende morfologische parameters gesynchroniseerd.`
        : `Classificatie in actieve casus bijgewerkt naar ${typeDef.shortLabel} (${typeDef.name}).`
    );
  };

  const handleApplyRecommendation = () => {
    const recommendedDef = getMatchingMasonType(recommendation.suggestedType);
    if (recommendedDef) {
      handleApplyMasonType(recommendedDef, false);
    } else {
      const updatedFeatures: Partial<FractureFeatures> = {
        classificationValue: recommendation.suggestedType,
        classificationSource: 'ai-suggested',
      };
      if (onUpdateCase && activeCase) {
        onUpdateCase({
          ...activeCase,
          fractureFeatures: {
            ...activeCase.fractureFeatures,
            ...updatedFeatures,
          },
        });
      }
      if (onUpdateFeatures) {
        onUpdateFeatures(updatedFeatures);
      }
      showFeedback(`Aanbevolen classificatie ${recommendation.suggestedType} toegepast op casus.`);
    }
  };

  const handleUpdateSource = (newSource: ClassificationSource) => {
    const updatedFeatures: Partial<FractureFeatures> = { classificationSource: newSource };
    if (onUpdateCase && activeCase) {
      onUpdateCase({
        ...activeCase,
        fractureFeatures: {
          ...activeCase.fractureFeatures,
          ...updatedFeatures,
        },
      });
    }
    if (onUpdateFeatures) {
      onUpdateFeatures(updatedFeatures);
    }
    showFeedback(`Bron van classificatie gewijzigd naar: ${newSource === 'clinician-entered' ? 'Door arts' : 'AI-suggestie'}.`);
  };

  const handleCharacteristicChange = (
    key: keyof FractureFeatures,
    value: any,
    description: string
  ) => {
    const updatedFeatures = { [key]: value };
    if (onUpdateCase && activeCase) {
      onUpdateCase({
        ...activeCase,
        fractureFeatures: {
          ...activeCase.fractureFeatures,
          ...updatedFeatures,
        },
      });
    }
    if (onUpdateFeatures) {
      onUpdateFeatures(updatedFeatures);
    }
    showFeedback(`Kenmerk gewijzigd: ${description}.`);
  };

  const handleDislocationChange = (presence: FeaturePresence) => {
    const updatedInjuries: Partial<AssociatedInjuries> = { dislocation: presence };
    const updatedFeatures: Partial<FractureFeatures> = {};
    if (presence === 'present') {
      updatedFeatures.classificationValue = 'Type IV (Mason-Johnston)';
      updatedFeatures.classificationSource = 'clinician-entered';
    }
    if (onUpdateCase && activeCase) {
      onUpdateCase({
        ...activeCase,
        fractureFeatures: {
          ...activeCase.fractureFeatures,
          ...updatedFeatures,
        },
        associatedInjuries: {
          ...activeCase.associatedInjuries,
          ...updatedInjuries,
        },
      });
    }
    if (onUpdateCaseData) {
      onUpdateCaseData(updatedFeatures, updatedInjuries);
    }
    showFeedback(
      presence === 'present'
        ? 'Elleboogluxatie aanwezig: Mason Type IV geactiveerd in casus.'
        : 'Geassocieerde dislocatie ingesteld op afwezig.'
    );
  };

  const resetView = () => {
    setActiveView('anterieur');
    setSelectedFeature(null);
    setShowMeasurements(true);
  };

  const featureDescriptions: Record<
    AnatomicalFeatureKey,
    { title: string; subtitle: string; anatomicalRole: string; clinicalSignificance: string }
  > = {
    radiuskop: {
      title: 'Radiuskop (Caput radii)',
      subtitle: 'Cilindrisch uiteinde van het proximale spaakbeen',
      anatomicalRole:
        'Articuleert met het capitulum humeri en de incisura radialis ulnae voor pronatie en supinatie.',
      clinicalSignificance:
        'Dient als secundaire stabilisator tegen valgusstress van de elleboog, primair wanneer het MCL deficiënt is.',
    },
    proximaal_radiusdeel: {
      title: 'Proximaal radiusdeel (Collum & Tuberositas)',
      subtitle: 'Radiusnek en aanhechting van de m. biceps brachii',
      anatomicalRole:
        'Verbindt de radiuskop met de radiusschacht. Bevat het collum radii en de tuberositas radii.',
      clinicalSignificance:
        'Fracturen van het collum kunnen leiden tot standsafwijkingen (angulatie) en impingement van de proximaal radioulnaire articulatie.',
    },
    gewrichtsoppervlak: {
      title: 'Gewrichtsoppervlak (Fovea articularis & facetten)',
      subtitle: 'Articulair hyalien kraakbeenoppervlak',
      anatomicalRole:
        'Komvormige depressie die soepel roteert over het bolle capitulum humeri bij flexie en extensie.',
      clinicalSignificance:
        'Articulaire step-off > 2 mm predisponeert voor post-traumatische artrose en pijn bij belaste rotatie.',
    },
    fractuurfragmenten: {
      title: 'Fractuurfragmenten (schematisch)',
      subtitle: 'Geïsoleerde botdelen bij comminutie',
      anatomicalRole:
        'Schematische indicatie van fragmentgrenzen (anterieure wig, posterolateraal segment en randfragment).',
      clinicalSignificance:
        'Bij meer dan 3 fragmenten (Mason III) is anatomische reconstructie met osteosynthese technisch veeleisend en kan radiuskopartroplastiek aangewezen zijn.',
    },
    verplaatsing: {
      title: 'Verplaatsing & Dislocatie (schematisch)',
      subtitle: 'Ruimtelijke translatie en decompressie van het gewrichtsvlak',
      anatomicalRole:
        'Diastase en verzakking van fragmenten ten opzichte van de anatomische contour.',
      clinicalSignificance:
        'Verplaatsing > 2 mm of angulatie > 30 graden vormt een klassiek criterium voor operatieve exploratie ter preventie van bewegingsblokkade.',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header and Disclaimer Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-teal-950 border border-teal-600/40 text-teal-300 uppercase tracking-wider">
                Interactieve Morfologie &amp; Classificatie
              </span>
              <span className="text-xs text-slate-400">Versie 1.1</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Fractuur Verkenner &amp; Mason Selector
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Interactief anatomisch diagram met dynamische Mason-classificatieselectie op basis van geïdentificeerde fractuurkenmerken.
            </p>
          </div>

          {/* Reset & View Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={resetView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Herstel weergave naar standaard"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Herstel</span>
            </button>
          </div>
        </div>

        {/* Mandatory warning banner */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-teal-500/30 rounded-lg flex items-center justify-between text-xs text-teal-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-medium">
              Schematische weergave — geen reconstructie of meting uit de CT-scan.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Fictief morfologisch model
          </span>
        </div>

        {/* Live feedback banner */}
        {statusFeedback && (
          <div className="mt-3 p-3 bg-teal-950/80 border border-teal-500/50 rounded-lg text-xs text-teal-200 flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}
      </div>

      {/* Main interactive area: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Anatomical SVG Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col space-y-4">
          {/* Top toolbar inside viewer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            {/* View angle toggle */}
            <div className="inline-flex p-1 bg-slate-950 rounded-lg border border-slate-800">
              {(['anterieur', 'posterieur', 'lateraal'] as ViewAngle[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1 rounded text-xs font-medium capitalize transition ${
                    activeView === view
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Overlay toggles */}
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showMeasurements}
                  onChange={(e) => setShowMeasurements(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500/20 w-3.5 h-3.5"
                />
                <span>Meting annotatie</span>
              </label>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative w-full h-[460px] bg-slate-950/90 rounded-lg flex items-center justify-center p-4 overflow-hidden border border-slate-800/80">
            {/* Subtle background anatomical grid */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#94A3B8" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Anatomical Schematic SVG */}
            <svg
              viewBox="0 0 500 560"
              className="w-full h-full max-h-[440px] drop-shadow-md select-none"
              aria-label="Schematische weergave van de radiuskop en breuklijnen"
            >
              <defs>
                <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E2E8F0" />
                  <stop offset="45%" stopColor="#F8FAFC" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>

                <linearGradient id="articularGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#99F6E4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.4" />
                </linearGradient>

                <linearGradient id="fragmentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>

                <filter id="glowTeal" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#14B8A6" floodOpacity="0.8" />
                </filter>
                <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* Distal Shaft & Proximal Radius Tuberosity */}
              <g
                id="proximal-radius"
                onClick={() => setSelectedFeature('proximaal_radiusdeel')}
                className="cursor-pointer transition duration-200"
                filter={selectedFeature === 'proximaal_radiusdeel' ? 'url(#glowTeal)' : undefined}
              >
                {/* Diaphyseal Shaft */}
                <path
                  d="M 205 320 Q 200 420 195 520 L 295 520 Q 290 420 285 320 Z"
                  fill="url(#boneGrad)"
                  stroke={selectedFeature === 'proximaal_radiusdeel' ? '#0D9488' : '#94A3B8'}
                  strokeWidth={selectedFeature === 'proximaal_radiusdeel' ? 3 : 2}
                />
                {/* Tuberositas radii (Biceps attachment) */}
                <path
                  d={
                    activeView === 'anterieur'
                      ? 'M 200 330 Q 175 350 190 380 Q 205 390 215 375 Z'
                      : activeView === 'lateraal'
                      ? 'M 205 340 Q 185 360 205 385 Z'
                      : 'M 285 330 Q 305 355 295 380 Z'
                  }
                  fill="#CBD5E1"
                  stroke="#64748B"
                  strokeWidth="1.5"
                />
                <text
                  x="200"
                  y="470"
                  fontSize="11"
                  fill="#64748B"
                  fontFamily="sans-serif"
                  fontWeight="500"
                >
                  Radiusdiaphyse
                </text>
              </g>

              {/* Radius Neck (Collum radii) */}
              <g
                id="collum-radii"
                onClick={() => setSelectedFeature('proximaal_radiusdeel')}
                className="cursor-pointer"
              >
                <path
                  d="M 215 220 Q 200 270 205 320 L 285 320 Q 290 270 275 220 Z"
                  fill="url(#boneGrad)"
                  stroke={selectedFeature === 'proximaal_radiusdeel' ? '#0D9488' : '#94A3B8'}
                  strokeWidth={selectedFeature === 'proximaal_radiusdeel' ? 3 : 2}
                />
                <text
                  x="225"
                  y="275"
                  fontSize="12"
                  fill="#475569"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  Collum
                </text>
              </g>

              {/* Main Radial Head Cylinder (Caput Radii) */}
              <g
                id="radial-head"
                onClick={() => setSelectedFeature('radiuskop')}
                className="cursor-pointer transition duration-200"
                filter={selectedFeature === 'radiuskop' ? 'url(#glowTeal)' : undefined}
              >
                {/* Head outer cylinder body */}
                <path
                  d="M 160 140 L 160 205 Q 160 220 215 220 L 275 220 Q 330 220 330 205 L 330 140 Q 330 155 245 155 Q 160 155 160 140 Z"
                  fill="url(#boneGrad)"
                  stroke={selectedFeature === 'radiuskop' ? '#0D9488' : '#64748B'}
                  strokeWidth={selectedFeature === 'radiuskop' ? 3 : 2}
                />
              </g>

              {/* Articular Surface (Fovea Articularis / Capitellar facet) */}
              <g
                id="articular-surface"
                onClick={() => setSelectedFeature('gewrichtsoppervlak')}
                className="cursor-pointer transition duration-200"
                filter={selectedFeature === 'gewrichtsoppervlak' ? 'url(#glowTeal)' : undefined}
              >
                {/* Concave oval cup at the top */}
                <ellipse
                  cx="245"
                  cy="140"
                  rx="85"
                  ry="26"
                  fill="url(#articularGrad)"
                  stroke={selectedFeature === 'gewrichtsoppervlak' ? '#0D9488' : '#14B8A6'}
                  strokeWidth={selectedFeature === 'gewrichtsoppervlak' ? 3 : 2}
                />
                {/* Central depression (Fovea) */}
                <ellipse
                  cx="245"
                  cy="140"
                  rx="55"
                  ry="16"
                  fill="#0D9488"
                  fillOpacity="0.25"
                  stroke="#0D9488"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="200"
                  y="144"
                  fontSize="11"
                  fill="#0F766E"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  Fovea articularis
                </text>
              </g>

              {/* Fracture Lines & Displaced Fragments (Schematic) */}
              <g
                id="fracture-fragments"
                onClick={() => setSelectedFeature('fractuurfragmenten')}
                className="cursor-pointer transition duration-200"
                filter={
                  selectedFeature === 'fractuurfragmenten'
                    ? 'url(#glowAmber)'
                    : selectedFeature === 'verplaatsing'
                    ? 'url(#glowAmber)'
                    : undefined
                }
              >
                {/* Displaced Wedge Fragment 1 (Anterolateral) */}
                <path
                  d="M 285 130 Q 345 135 348 155 L 342 208 Q 305 218 290 195 Z"
                  fill="url(#fragmentGrad)"
                  fillOpacity="0.85"
                  stroke="#B45309"
                  strokeWidth="2.5"
                  transform={
                    selectedFeature === 'verplaatsing' || fractureFeatures.displacement === 'present'
                      ? 'translate(8, -6) rotate(3, 290, 170)'
                      : 'translate(0, 0)'
                  }
                />

                {/* Secondary Fragment 2 (Marginal Cortical Slice) */}
                {simulatedFragmentCount >= 2 && (
                  <path
                    d="M 245 155 L 285 190 L 265 218 L 230 195 Z"
                    fill="#FDE68A"
                    fillOpacity="0.8"
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeDasharray="1,1"
                    transform={
                      selectedFeature === 'verplaatsing' || fractureFeatures.displacement === 'present'
                        ? 'translate(2, 4)'
                        : 'translate(0, 0)'
                    }
                  />
                )}

                {/* Third Fragment (Impaction / Comminution) */}
                {simulatedFragmentCount >= 3 && (
                  <path
                    d="M 292 195 L 325 204 L 305 230 L 280 215 Z"
                    fill="#FBBF24"
                    fillOpacity="0.75"
                    stroke="#B45309"
                    strokeWidth="1.5"
                  />
                )}

                {/* Sharp jagged fracture fracture lines */}
                <path
                  d="M 280 120 L 286 142 L 275 168 L 292 195 L 278 222 L 284 250"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="bevel"
                />
                <path
                  d="M 245 155 L 260 178 L 250 198 L 265 218"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="1.8"
                  strokeDasharray="4,2"
                />
              </g>

              {/* Displacement / Step-off Annotations */}
              {showMeasurements && (
                <g id="annotations" pointerEvents="none">
                  {/* Caliper lines showing articular step-off */}
                  <line x1="330" y1="130" x2="385" y2="130" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1="348" y1="149" x2="385" y2="149" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1="375" y1="130" x2="375" y2="149" stroke="#0D9488" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Dimension pill */}
                  <rect x="365" y="155" width="110" height="24" rx="4" fill="#042F2E" stroke="#14B8A6" strokeWidth="1" />
                  <text x="372" y="171" fontSize="11" fill="#5EEAD4" fontWeight="600" fontFamily="sans-serif">
                    Step-off: {fractureFeatures.measuredDisplacementMm ? `${fractureFeatures.measuredDisplacementMm} mm` : '3.2 mm (demo)'}
                  </text>

                  {/* Diastasis arrow */}
                  <path d="M 330 180 L 355 180" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrowAmber)" />
                  <rect x="345" y="195" width="125" height="22" rx="4" fill="#451A03" stroke="#F59E0B" strokeWidth="1" />
                  <text x="352" y="210" fontSize="10" fill="#FDE68A" fontWeight="600" fontFamily="sans-serif">
                    Diastase: ~3-4 mm
                  </text>
                </g>
              )}

              {/* Marker Definitions */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#0D9488" />
                </marker>
                <marker id="arrowAmber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
                </marker>
              </defs>
            </svg>

            {/* View angle badge in canvas */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] text-slate-300 backdrop-blur-sm">
              Weergave: <span className="font-semibold text-teal-400 capitalize">{activeView}</span>
            </div>
          </div>

          {/* Interactive Feature Hotbar / Legend */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Selecteer anatomisch element om te inspecteren:</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { key: 'radiuskop', label: 'Radiuskop', color: 'bg-slate-700' },
                  { key: 'proximaal_radiusdeel', label: 'Proximaal radiusdeel', color: 'bg-slate-700' },
                  { key: 'gewrichtsoppervlak', label: 'Gewrichtsoppervlak', color: 'bg-teal-700' },
                  { key: 'fractuurfragmenten', label: 'Fractuurfragmenten', color: 'bg-amber-600' },
                  { key: 'verplaatsing', label: 'Verplaatsing (schematisch)', color: 'bg-red-700' },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedFeature(item.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center gap-2 border transition ${
                    selectedFeature === item.key
                      ? 'bg-slate-800 border-teal-500 text-teal-300 shadow-sm ring-1 ring-teal-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mason Selector & Anatomical Guides (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* MASON CLASSIFICATION SELECTOR CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mason Classificatie Selector
                </h3>
              </div>
              <span className="text-[11px] text-teal-400 font-semibold font-mono">
                Hotchkiss / Johnston
              </span>
            </div>

            {/* Quick 1-Click Type Switcher Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Snelle Typekeuze:</span>
                <span className="text-slate-500">Klik om type direct in casus te activeren</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {MASON_TYPES.map((typeDef) => {
                  const isSelected = activeMasonType?.typeKey === typeDef.typeKey;
                  const matchResult = evaluatedMasonTypes.find((m) => m.typeKey === typeDef.typeKey);
                  const isRecommended = matchResult?.isRecommended;

                  return (
                    <button
                      key={typeDef.typeKey}
                      onClick={() => handleApplyMasonType(typeDef, false)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 border-teal-500 text-white shadow-md ring-1 ring-teal-400/50'
                          : isRecommended
                          ? 'bg-slate-950 border-amber-500/60 text-amber-300 hover:bg-slate-800'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={`Selecteer ${typeDef.name} (${matchResult?.matchesCount ?? 0}/${matchResult?.totalCount ?? 3} criteria matchen)`}
                    >
                      <div className="flex items-center gap-1">
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                        <span>{typeDef.shortLabel}</span>
                        {isRecommended && !isSelected && (
                          <span className="text-[10px] text-amber-400">★</span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] px-1 rounded font-mono ${
                          isSelected
                            ? 'bg-teal-700/80 text-teal-100'
                            : matchResult?.matchesCount === matchResult?.totalCount
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'text-slate-400'
                        }`}
                      >
                        {matchResult ? `${matchResult.matchesCount}/${matchResult.totalCount}` : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Classification Status Header */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Actieve Casusclassificatie:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    activeMasonType
                      ? activeMasonType.badgeColor
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {fractureFeatures.classificationValue || 'Niet beoordeeld'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                <span className="text-slate-500">Bron van registratie:</span>
                <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                  <button
                    onClick={() => handleUpdateSource('clinician-entered')}
                    className={`px-2 py-0.5 text-[10px] rounded font-medium transition cursor-pointer ${
                      fractureFeatures.classificationSource === 'clinician-entered'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Door arts
                  </button>
                  <button
                    onClick={() => handleUpdateSource('ai-suggested')}
                    className={`px-2 py-0.5 text-[10px] rounded font-medium transition cursor-pointer ${
                      fractureFeatures.classificationSource === 'ai-suggested'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AI-suggestie
                  </button>
                </div>
              </div>
            </div>

            {/* Algorithmic Recommendation Banner */}
            <div className="p-3.5 bg-gradient-to-r from-teal-950/70 via-slate-950 to-slate-950 border border-teal-500/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-teal-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Aanbevolen op basis van morfologie:</span>
                </div>
                <span className="text-xs font-bold text-teal-200 bg-teal-900/80 px-2 py-0.5 rounded border border-teal-600/50">
                  {recommendation.suggestedType}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {recommendation.rationale}
              </p>
              {fractureFeatures.classificationValue !== recommendation.suggestedType && (
                <button
                  onClick={handleApplyRecommendation}
                  className="w-full mt-1.5 py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Neem aanbeveling direct over in casus ({recommendation.suggestedType.split(' ')[0]} {recommendation.suggestedType.split(' ')[1] || ''})</span>
                </button>
              )}
            </div>

            {/* Interactive Mason Type Selector Cards (I, II, III, IV) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Selecteer Type op basis van kenmerken:
                </span>
                <span className="text-[10px] text-slate-500">Live compatibiliteit</span>
              </div>

              <div className="space-y-2.5">
                {MASON_TYPES.map((typeDef) => {
                  const isSelected = activeMasonType?.typeKey === typeDef.typeKey;
                  const matchResult = evaluatedMasonTypes.find((m) => m.typeKey === typeDef.typeKey);
                  const isRecommended = matchResult?.isRecommended;
                  const allMatched = matchResult && matchResult.matchesCount === matchResult.totalCount;

                  return (
                    <div
                      key={typeDef.typeKey}
                      className={`p-3.5 rounded-xl border transition text-xs space-y-2.5 ${
                        isSelected
                          ? 'bg-slate-950 border-teal-500 ring-1 ring-teal-500/40 shadow-md'
                          : isRecommended
                          ? 'bg-slate-950/80 border-teal-500/40 hover:border-teal-500/70'
                          : 'bg-slate-950/60 border-slate-800/90 hover:bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                              typeDef.badgeColor
                            }`}
                          >
                            {typeDef.shortLabel}
                          </span>
                          <span className="font-bold text-slate-100 text-xs">
                            {typeDef.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isRecommended && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-700/80">
                              ★ Aanbevolen
                            </span>
                          )}
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-700">
                              ✓ Actief in casus
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Criteria Match Ratio Pill */}
                      {matchResult && (
                        <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                          <span className="text-slate-400">Match met huidige casus:</span>
                          <span
                            className={`font-semibold flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                              allMatched
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                                : matchResult.matchesCount >= 2
                                ? 'bg-teal-950 text-teal-300 border border-teal-800/60'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {allMatched && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                            <span>
                              {matchResult.matchesCount} van {matchResult.totalCount} criteria voldaan
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Criteria Comparison Breakdown */}
                      {matchResult && (
                        <div className="space-y-1 bg-slate-950/70 p-2.5 rounded-lg border border-slate-900">
                          {matchResult.criteria.map((c, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between text-[11px] gap-2 py-0.5"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                {c.matched ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                )}
                                <span
                                  className={`truncate ${
                                    c.matched ? 'text-slate-200 font-medium' : 'text-slate-400'
                                  }`}
                                >
                                  {c.criterionDescription}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-mono shrink-0 px-1.5 py-0.2 rounded ${
                                  c.matched
                                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40'
                                    : 'text-slate-400 bg-slate-900'
                                }`}
                              >
                                {c.currentValueDescription}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Clinical Implication */}
                      <p className="text-[11px] text-slate-400 leading-snug italic">
                        {typeDef.clinicalImplication}
                      </p>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                        {isSelected ? (
                          <div className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-teal-950/60 border border-teal-600/40 text-teal-300 flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-teal-400" />
                            <span>Geselecteerd in casus</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApplyMasonType(typeDef, false)}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Kies {typeDef.shortLabel}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleApplyMasonType(typeDef, true)}
                          className="py-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1 shrink-0 cursor-pointer"
                          title={`Stel ook verplaatsing, fragmentatie en luxatie in passend bij ${typeDef.shortLabel}`}
                        >
                          <span>Sync kenmerken</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Morphological Characteristic Adjusters */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>Geïdentificeerde Morfologie (Live Update)</span>
                </span>
                <span className="text-[11px] text-slate-400">Directe beïnvloeding</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Fragmentation Selector */}
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-300 font-medium">Fragmentatiegraad:</span>
                  <div className="flex gap-1.5">
                    {[
                      { val: 'limited', label: '1-2 wig' },
                      { val: 'multiple', label: '≥3 comminutief' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() =>
                          handleCharacteristicChange(
                            'fragmentation',
                            opt.val as FragmentationRating,
                            `Fragmentatie ingesteld op ${opt.label}`
                          )
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                          fractureFeatures.fragmentation === opt.val
                            ? 'bg-teal-600 border-teal-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Displacement & Measured mm */}
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Verplaatsing &gt; 2 mm:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() =>
                          handleCharacteristicChange(
                            'displacement',
                            'absent',
                            'Verplaatsing gemarkeerd als afwezig (< 2 mm)'
                          )
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                          fractureFeatures.displacement === 'absent'
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        Nee (&lt; 2mm)
                      </button>
                      <button
                        onClick={() =>
                          handleCharacteristicChange(
                            'displacement',
                            'present',
                            'Verplaatsing gemarkeerd als aanwezig (≥ 2 mm)'
                          )
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                          fractureFeatures.displacement === 'present'
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        Ja (≥ 2mm)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                    <span className="text-slate-400 text-[11px]">Gemeten step-off (mm):</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={fractureFeatures.measuredDisplacementMm ?? 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        handleCharacteristicChange(
                          'measuredDisplacementMm',
                          isNaN(val) ? 0 : val,
                          `Step-off aangepast naar ${val} mm`
                        );
                      }}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs font-mono text-right focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Associated Dislocation (for Mason IV) */}
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-300 font-medium">Elleboogdislocatie (Luxatie):</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleDislocationChange('absent')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                        associatedInjuries?.dislocation !== 'present'
                          ? 'bg-teal-600 border-teal-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Geen
                    </button>
                    <button
                      onClick={() => handleDislocationChange('present')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                        associatedInjuries?.dislocation === 'present'
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Luxatie (Type IV)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Anatomical Detail Card */}
          {selectedFeature ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                  Geselecteerd Element
                </span>
                <span className="text-xs text-slate-400">Anatomische Gids</span>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-white">
                  {featureDescriptions[selectedFeature].title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {featureDescriptions[selectedFeature].subtitle}
                </p>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-1">
                      Anatomische functie:
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      {featureDescriptions[selectedFeature].anatomicalRole}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-semibold text-amber-400 block mb-1">
                      Klinische relevantie bij radiuskopfracturen:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {featureDescriptions[selectedFeature].clinicalSignificance}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
              <Eye className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">
                Klik op een onderdeel in het diagram of op een knop in de legenda om details te bekijken.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
