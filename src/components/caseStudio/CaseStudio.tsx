/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, ChangeEvent } from 'react';
import {
  FileText,
  Upload,
  X,
  Check,
  AlertTriangle,
  Sparkles,
  Save,
  HelpCircle,
  Eye,
  Info,
} from 'lucide-react';
import {
  Case,
  ClinicalSide,
  ImagingModality,
  ImagingSourceType,
  FeaturePresence,
  StabilityRating,
  FragmentationRating,
  ClassificationSource,
} from '../../types/ortho';
import { suggestMasonClassification } from '../../utils/orthoRules';

interface Props {
  activeCase: Case;
  onSaveCase: (updatedCase: Case) => void;
  onNavigateToAIReview: () => void;
}

export const CaseStudio: React.FC<Props> = ({
  activeCase,
  onSaveCase,
  onNavigateToAIReview,
}) => {
  const [caseState, setCaseState] = useState<Case>(activeCase);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [suggestedMasonNotice, setSuggestedMasonNotice] = useState<{
    type: string;
    rationale: string;
    note: string;
  } | null>(null);

  // Sync state if activeCase changes externally
  React.useEffect(() => {
    setCaseState(activeCase);
  }, [activeCase.id]);

  const handleMetadataChange = (field: string, value: any) => {
    setCaseState((prev) => ({
      ...prev,
      clinicalContext: {
        ...prev.clinicalContext,
        [field]: value,
      },
    }));
  };

  const handleImagingChange = (field: string, value: any) => {
    setCaseState((prev) => ({
      ...prev,
      imagingInput: {
        ...prev.imagingInput,
        [field]: value,
      },
    }));
  };

  const handleFractureChange = (field: string, value: any) => {
    setCaseState((prev) => ({
      ...prev,
      fractureFeatures: {
        ...prev.fractureFeatures,
        [field]: value,
      },
    }));
  };

  const handleAssociatedChange = (field: string, value: any) => {
    setCaseState((prev) => ({
      ...prev,
      associatedInjuries: {
        ...prev.associatedInjuries,
        [field]: value,
      },
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      alert('Upload uitsluitend PNG- of JPEG-afbeeldingen.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Afbeeldingsgrootte overschrijdt het maximum van 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCaseState((prev) => ({
        ...prev,
        imagingInput: {
          ...prev.imagingInput,
          sourceType: 'uploaded_image',
          imageName: file.name,
          imageAvailable: true,
          imageDataUrl: result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCaseState((prev) => ({
      ...prev,
      imagingInput: {
        ...prev.imagingInput,
        sourceType: prev.imagingInput.observations ? 'manual' : 'none',
        imageName: null,
        imageAvailable: false,
        imageDataUrl: null,
      },
    }));
  };

  const handleCalculateMasonSuggestion = () => {
    const suggestion = suggestMasonClassification(
      caseState.fractureFeatures,
      caseState.associatedInjuries
    );
    setSuggestedMasonNotice({
      type: suggestion.suggestedType,
      rationale: suggestion.rationale,
      note: suggestion.confidenceNote,
    });
  };

  const handleApplyMasonSuggestion = () => {
    if (!suggestedMasonNotice) return;
    setCaseState((prev) => ({
      ...prev,
      fractureFeatures: {
        ...prev.fractureFeatures,
        classificationValue: suggestedMasonNotice.type,
        classificationSource: 'ai-suggested',
      },
    }));
    setSuggestedMasonNotice(null);
  };

  const handleSave = () => {
    onSaveCase(caseState);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-teal-950 border border-teal-600/40 text-teal-300 uppercase tracking-wider">
                Casus Studio
              </span>
              <span className="text-xs text-slate-400">ID: {caseState.id}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Casusgegevens & Beoordelingsinvoer
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Gestructureerd formulier voor anamnese, traumamechanisme, beeldobservaties en fractuureigenschappen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Casus opslaan</span>
            </button>
            <button
              onClick={() => {
                handleSave();
                onNavigateToAIReview();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Naar AI-analyse</span>
            </button>
          </div>
        </div>

        {saveSuccessNotice && (
          <div className="mt-4 p-3 bg-teal-950/70 border border-teal-500/40 rounded-lg text-xs text-teal-200 flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-teal-400" />
            <span>Casusgegevens succesvol bijgewerkt in het huidige sessiegeheugen.</span>
          </div>
        )}
      </div>

      {/* Anonymization Guard Notice */}
      <div className="p-4 bg-slate-900/90 border-l-4 border-teal-500 border-y border-r border-slate-800 rounded-r-xl text-xs text-slate-300 space-y-1">
        <div className="font-semibold text-teal-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-400" />
          <span>Privacy- en Anonimiseringswaarborg:</span>
        </div>
        <p className="text-slate-400 leading-relaxed pl-6">
          Voer <strong>geen</strong> echte patiëntidentificatoren in (zoals naam, geboortedatum of BSN/ziekenhuisnummer). Gebruik uitsluitend een fictief casus-ID en anonieme leeftijdscategorieën.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Metadata & Imaging (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Casus Metadata */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>1. Casus Metadata (Anoniem)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Casustitel <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  value={caseState.title}
                  onChange={(e) => setCaseState({ ...caseState, title: e.target.value })}
                  placeholder="Bijv. Demo RH-001 — Meerfragmentaire radiuskopfractuur"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Fictief Casus-ID</label>
                <input
                  type="text"
                  value={caseState.id}
                  onChange={(e) => setCaseState({ ...caseState, id: e.target.value })}
                  placeholder="Bijv. RH-001"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Leeftijdscategorie (optioneel)</label>
                <select
                  value={caseState.clinicalContext.ageBand || ''}
                  onChange={(e) => handleMetadataChange('ageBand', e.target.value || null)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="">Niet gespecificeerd</option>
                  <option value="18-29">18 - 29 jaar</option>
                  <option value="30-39">30 - 39 jaar</option>
                  <option value="40-49">40 - 49 jaar</option>
                  <option value="50-59">50 - 59 jaar</option>
                  <option value="60-69">60 - 69 jaar</option>
                  <option value="70+">70+ jaar</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Aangedane Zijde</label>
                <select
                  value={caseState.clinicalContext.side}
                  onChange={(e) => handleMetadataChange('side', e.target.value as ClinicalSide)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="unknown">Onbekend / Niet gespecificeerd</option>
                  <option value="left">Links</option>
                  <option value="right">Rechts</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Traumamechanisme</label>
                <input
                  type="text"
                  value={caseState.clinicalContext.injuryMechanism}
                  onChange={(e) => handleMetadataChange('injuryMechanism', e.target.value)}
                  placeholder="Bijv. Val op uitgestrekte hand (FOOSH) met valgus- en supinatiekracht"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tijd sinds trauma</label>
                <input
                  type="text"
                  value={caseState.clinicalContext.timeSinceInjury}
                  onChange={(e) => handleMetadataChange('timeSinceInjury', e.target.value)}
                  placeholder="Bijv. 18 uur geleden"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Klinische Notities & Onderzoek</label>
                <textarea
                  rows={3}
                  value={caseState.clinicalContext.notes}
                  onChange={(e) => handleMetadataChange('notes', e.target.value)}
                  placeholder="Klinische bevindingen, zwelling, rotatiebeperking, neurovasculair onderzoek..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Imaging Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>2. Beeldvormingsinvoer & Demobestand</span>
            </h3>

            {/* Warning before upload */}
            <div className="p-3 bg-amber-950/30 border border-amber-600/30 rounded-lg text-[11px] text-amber-200/90 leading-relaxed">
              <span className="font-semibold text-amber-300 block mb-1">
                Let op bij beeldmateriaal:
              </span>
              Gebruik uitsluitend fictieve of correct geanonimiseerde beelden waarvoor je toestemming en gebruiksrechten hebt. Geüploade beelden kunnen naar een externe AI-dienst worden verstuurd wanneer je AI-analyse start.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Modaliteit</label>
                <select
                  value={caseState.imagingInput.modality}
                  onChange={(e) => handleImagingChange('modality', e.target.value as ImagingModality)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="none">Geen beeldvorming beschikbaar</option>
                  <option value="xray">Röntgenfoto (X-ray)</option>
                  <option value="ct">CT-scan (2D / Multiplanaire reconstructie)</option>
                  <option value="other">Overig / MRI / Echo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Bron van gegevens</label>
                <select
                  value={caseState.imagingInput.sourceType}
                  onChange={(e) => handleImagingChange('sourceType', e.target.value as ImagingSourceType)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="none">Geen</option>
                  <option value="manual">Handmatig ingevoerde radiologie-observaties</option>
                  <option value="uploaded_image">Geüploade demobeeld</option>
                </select>
              </div>
            </div>

            {/* Image upload area */}
            <div className="p-4 bg-slate-950/80 border border-dashed border-slate-700 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Optionele demo-afbeelding (PNG of JPEG, max 10MB)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Blijft uitsluitend in browser-geheugen; DICOM wordt niet ondersteund in V1.
                  </span>
                </div>
                <div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-slate-200 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-teal-400" />
                    <span>Selecteer bestand</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Preview if available */}
              {caseState.imagingInput.imageAvailable && (
                <div className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {caseState.imagingInput.imageDataUrl ? (
                      <img
                        src={caseState.imagingInput.imageDataUrl}
                        alt="Preview demo"
                        className="w-12 h-12 object-cover rounded border border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] text-teal-400 font-bold">
                        IMG
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-medium text-slate-200 block truncate max-w-xs">
                        {caseState.imagingInput.imageName || 'Voorbeeldafbeelding geactiveerd'}
                      </span>
                      <span className="text-[10px] text-teal-400">In sessiegeheugen geladen</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveImage}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                    title="Verwijder afbeelding"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Manual Imaging Observations */}
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Handmatige beeldobservaties / Radiologieverslag
              </label>
              <textarea
                rows={3}
                value={caseState.imagingInput.observations}
                onChange={(e) => handleImagingChange('observations', e.target.value)}
                placeholder="Bijv. AP en laterale opnames tonen een anterolaterale corticale onderbreking met 3 mm step-off..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Fracture Features & Associated Injuries (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>3. Fractuurkenmerken</span>
              </h3>
              <span className="text-[11px] text-teal-400 font-medium">Classificatie</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Fragmentation */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Fragmentatie</label>
                <select
                  value={caseState.fractureFeatures.fragmentation}
                  onChange={(e) => handleFractureChange('fragmentation', e.target.value as FragmentationRating)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="not_assessed">Niet beoordeeld</option>
                  <option value="limited">Beperkt (1-2 fragmenten / wig)</option>
                  <option value="multiple">Meerfragmentair / Communitief (&ge;3 fragmenten)</option>
                </select>
              </div>

              {/* Articular Surface Involvement */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Gewrichtsoppervlakbetrokkenheid</label>
                <select
                  value={caseState.fractureFeatures.articularInvolvement}
                  onChange={(e) => handleFractureChange('articularInvolvement', e.target.value as FeaturePresence)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="not_assessed">Niet beoordeeld</option>
                  <option value="absent">Afwezig (extra-articulair)</option>
                  <option value="present">Aanwezig (intra-articulair)</option>
                  <option value="uncertain">Onzeker / Twijfelachtig</option>
                </select>
              </div>

              {/* Displacement Presence */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Verplaatsing</label>
                <select
                  value={caseState.fractureFeatures.displacement}
                  onChange={(e) => handleFractureChange('displacement', e.target.value as FeaturePresence)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="not_assessed">Niet beoordeeld</option>
                  <option value="absent">Afwezig (&lt; 2 mm)</option>
                  <option value="present">Aanwezig (&ge; 2 mm)</option>
                  <option value="uncertain">Onzeker</option>
                </select>
              </div>

              {/* Measured displacement in mm (manual only) */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Gemeten verplaatsing in millimeters (handmatige invoer)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  value={caseState.fractureFeatures.measuredDisplacementMm ?? ''}
                  onChange={(e) =>
                    handleFractureChange(
                      'measuredDisplacementMm',
                      e.target.value === '' ? null : parseFloat(e.target.value)
                    )
                  }
                  placeholder="Bijv. 3.2"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Niet automatisch afgeleid van schematische diagrammen.
                </span>
              </div>

              {/* Mechanical Stability */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Mechanische Stabiliteit</label>
                <select
                  value={caseState.fractureFeatures.stability}
                  onChange={(e) => handleFractureChange('stability', e.target.value as StabilityRating)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="not_assessed">Niet beoordeeld</option>
                  <option value="stable">Stabiel (geen rotatieblokkade/valgusinstabiliteit)</option>
                  <option value="unstable">Instabiel</option>
                  <option value="uncertain">Onzeker / Nader te onderzoeken</option>
                </select>
              </div>

              {/* Mason Classification & Source */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-200 font-bold">Mason Classificatie</label>
                  <button
                    type="button"
                    onClick={handleCalculateMasonSuggestion}
                    className="text-[11px] text-teal-400 hover:text-teal-300 underline underline-offset-2 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Bereken suggestie</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Waarde</span>
                    <input
                      type="text"
                      value={caseState.fractureFeatures.classificationValue}
                      onChange={(e) => handleFractureChange('classificationValue', e.target.value)}
                      placeholder="Type I, II, III of IV"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Bron van waarde</span>
                    <select
                      value={caseState.fractureFeatures.classificationSource}
                      onChange={(e) =>
                        handleFractureChange('classificationSource', e.target.value as ClassificationSource)
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="clinician-entered">Door arts ingevoerd</option>
                      <option value="ai-suggested">AI-suggestie (in beraad)</option>
                      <option value="not-assessed">Niet beoordeeld</option>
                    </select>
                  </div>
                </div>

                {/* Suggestion popover/card if triggered */}
                {suggestedMasonNotice && (
                  <div className="mt-3 p-3 bg-slate-950 border border-teal-500/50 rounded-lg text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-300">
                        Suggestie: {suggestedMasonNotice.type}
                      </span>
                      <button
                        onClick={() => setSuggestedMasonNotice(null)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {suggestedMasonNotice.rationale}
                    </p>
                    <p className="text-amber-300/90 text-[10px] italic">
                      {suggestedMasonNotice.note}
                    </p>
                    <button
                      onClick={handleApplyMasonSuggestion}
                      className="w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold transition"
                    >
                      Als AI-suggestie overnemen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Associated Injuries */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>4. Geassocieerde Letsels</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Geassocieerde Elleboogluxatie</label>
                <select
                  value={caseState.associatedInjuries.dislocation}
                  onChange={(e) => handleAssociatedChange('dislocation', e.target.value as FeaturePresence)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="not_assessed">Niet beoordeeld</option>
                  <option value="absent">Afwezig</option>
                  <option value="present">Aanwezig (Mason IV indicatie)</option>
                  <option value="uncertain">Onzeker</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Processus Coronoideus Fractuur</label>
                <select
                  value={caseState.associatedInjuries.coronoid}
                  onChange={(e) => handleAssociatedChange('coronoid', e.target.value as FeaturePresence)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="not_assessed">Niet beoordeeld</option>
                  <option value="absent">Afwezig</option>
                  <option value="present">Aanwezig (Terrible triad verdenking)</option>
                  <option value="uncertain">Onzeker / Overprojectie op röntgen</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Verdenking Ligamentair Letsel (LUCL/MCL)</label>
                <select
                  value={caseState.associatedInjuries.ligamentConcern}
                  onChange={(e) => handleAssociatedChange('ligamentConcern', e.target.value as FeaturePresence)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="not_assessed">Niet beoordeeld</option>
                  <option value="absent">Afwezig</option>
                  <option value="present">Aanwezig / Verhoogde bezorgdheid</option>
                  <option value="uncertain">Onzeker</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Overige Letsels & Bevindingen</label>
                <textarea
                  rows={2}
                  value={caseState.associatedInjuries.otherFindings}
                  onChange={(e) => handleAssociatedChange('otherFindings', e.target.value)}
                  placeholder="Bijv. DRUJ palpatie, polsonderzoek, interosseus membraan (Essex-Lopresti uitsluiten)..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
