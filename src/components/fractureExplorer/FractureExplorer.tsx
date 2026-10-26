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
} from 'lucide-react';
import { FractureFeatures } from '../../types/ortho';

type ViewAngle = 'anterieur' | 'posterieur' | 'lateraal';

type AnatomicalFeatureKey =
  | 'radiuskop'
  | 'proximaal_radiusdeel'
  | 'gewrichtsoppervlak'
  | 'fractuurfragmenten'
  | 'verplaatsing';

interface Props {
  fractureFeatures: FractureFeatures;
  onUpdateFeatures?: (updated: Partial<FractureFeatures>) => void;
}

export const FractureExplorer: React.FC<Props> = ({
  fractureFeatures,
  onUpdateFeatures,
}) => {
  const [activeView, setActiveView] = useState<ViewAngle>('anterieur');
  const [selectedFeature, setSelectedFeature] = useState<AnatomicalFeatureKey | null>(
    'fractuurfragmenten'
  );
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [simulatedFragmentCount, setSimulatedFragmentCount] = useState<number>(
    fractureFeatures.fragmentation === 'multiple' ? 3 : 1
  );

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
                Interactieve Morfologie
              </span>
              <span className="text-xs text-slate-400">Versie 1.0</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Fractuur Verkenner — Caput Radii
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Interactief anatomisch diagram voor educatieve evaluatie van breuklijnen en gewrichtscongruentie.
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
      </div>

      {/* Main interactive area: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Anatomical SVG Viewer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
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
          <div className="relative w-full h-[460px] bg-slate-950/90 rounded-lg my-4 flex items-center justify-center p-4 overflow-hidden border border-slate-800/80">
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

        {/* Right Column: Anatomical & Clinical Details Side Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Feature Detail Card */}
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

          {/* Interactive Simulation Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Simulatie van fragmentatiegraad</span>
            </h4>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Aantal fragmenten in simulatie:</span>
                <span className="font-semibold text-teal-400">{simulatedFragmentCount} fragment(en)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setSimulatedFragmentCount(count);
                      if (onUpdateFeatures) {
                        onUpdateFeatures({
                          fragmentation: count >= 3 ? 'multiple' : 'limited',
                        });
                      }
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      simulatedFragmentCount === count
                        ? 'bg-teal-600 border-teal-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {count === 1 ? '1 fragment (Wig)' : count === 2 ? '2 fragmenten' : '3+ fragmenten (Comminutie)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Correlation Card */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Casuskoppeling (Huidig dossier):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-500 block">Classificatie:</span>
                  <span className="text-slate-200 font-medium">{fractureFeatures.classificationValue}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gemeten stap:</span>
                  <span className="text-slate-200 font-medium">
                    {fractureFeatures.measuredDisplacementMm ? `${fractureFeatures.measuredDisplacementMm} mm` : 'Geen'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Stabiliteit:</span>
                  <span className="text-slate-200 font-medium capitalize">{fractureFeatures.stability}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Bron classificatie:</span>
                  <span className="text-slate-200 font-medium capitalize">
                    {fractureFeatures.classificationSource}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
