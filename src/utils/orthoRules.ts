/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AIReview,
  ClinicianReview,
  FractureFeatures,
  AssociatedInjuries,
  ReviewItemStatus,
} from '../types/ortho';

export interface MasonTypeDefinition {
  typeKey: string;
  name: string;
  shortLabel: string;
  badgeColor: string;
  characteristics: {
    fragmentation: string;
    articular: string;
    displacement: string;
    stability: string;
    dislocation: string;
  };
  presetFeatures: Partial<FractureFeatures>;
  presetInjuries?: Partial<AssociatedInjuries>;
  criteriaSummary: string;
  clinicalImplication: string;
}

export const MASON_TYPES: MasonTypeDefinition[] = [
  {
    typeKey: 'type_1',
    name: 'Type I (Niet-verplaatst)',
    shortLabel: 'Mason I',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    characteristics: {
      fragmentation: '1 fragment / fissuur',
      articular: '< 2 mm of afwezig',
      displacement: '< 2 mm (niet-verplaatst)',
      stability: 'Stabiel (geen rotatieblokkade)',
      dislocation: 'Afwezig',
    },
    presetFeatures: {
      fragmentation: 'limited',
      articularInvolvement: 'absent',
      displacement: 'absent',
      measuredDisplacementMm: 0,
      stability: 'stable',
      classificationValue: 'Type I (Niet-verplaatst)',
    },
    presetInjuries: {
      dislocation: 'absent',
    },
    criteriaSummary: 'Fissuur of marginale fractuur met < 2 mm verplaatsing en behoud van rotatie.',
    clinicalImplication: 'Gewoonlijk conservatieve behandeling met vroege actieve mobilisatie.',
  },
  {
    typeKey: 'type_2',
    name: 'Type II (Verplaatst wig- of randsegment)',
    shortLabel: 'Mason II',
    badgeColor: 'bg-teal-950 text-teal-300 border-teal-700',
    characteristics: {
      fragmentation: '1 - 2 fragmenten',
      articular: 'Betrokken (> 2 mm step-off)',
      displacement: '≥ 2 mm verplaatsing',
      stability: 'Mogelijk mechanische blokkade',
      dislocation: 'Afwezig',
    },
    presetFeatures: {
      fragmentation: 'limited',
      articularInvolvement: 'present',
      displacement: 'present',
      measuredDisplacementMm: 2.5,
      stability: 'uncertain',
      classificationValue: 'Type II (Verplaatst wig- of randsegment)',
    },
    presetInjuries: {
      dislocation: 'absent',
    },
    criteriaSummary: 'Partiële fractuur van de radiuskop met > 2 mm verplaatsing of mechanische blokkade.',
    clinicalImplication: 'Overweeg ORIF (schroeffixatie) indien mechanische blokkade of grote fragmentgrootte.',
  },
  {
    typeKey: 'type_3',
    name: 'Type III (Communitief)',
    shortLabel: 'Mason III',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
    characteristics: {
      fragmentation: '≥ 3 fragmenten (comminutie)',
      articular: 'Gehele gewrichtsvlak betrokken',
      displacement: 'Verplaatst / ingedeukt',
      stability: 'Instabiel / onzeker',
      dislocation: 'Afwezig',
    },
    presetFeatures: {
      fragmentation: 'multiple',
      articularInvolvement: 'present',
      displacement: 'present',
      measuredDisplacementMm: 3.5,
      stability: 'uncertain',
      classificationValue: 'Type III (Communitief)',
    },
    presetInjuries: {
      dislocation: 'absent',
    },
    criteriaSummary: 'Meerfragmentaire comminutie van de gehele radiuskop zonder eenvoudig reconstrueerbaar blok.',
    clinicalImplication: 'Vaak indicatie voor radiuskopprothese (RHP) of complexe reconstructie.',
  },
  {
    typeKey: 'type_4',
    name: 'Type IV (Mason-Johnston)',
    shortLabel: 'Mason IV',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-700',
    characteristics: {
      fragmentation: 'Variabel (vaak multi-fragment)',
      articular: 'Betrokken',
      displacement: 'Aanwezig',
      stability: 'Instabiel',
      dislocation: 'Aanwezig (elleboogluxatie)',
    },
    presetFeatures: {
      fragmentation: 'multiple',
      articularInvolvement: 'present',
      displacement: 'present',
      measuredDisplacementMm: 4.0,
      stability: 'unstable',
      classificationValue: 'Type IV (Mason-Johnston)',
    },
    presetInjuries: {
      dislocation: 'present',
    },
    criteriaSummary: 'Radiuskopfractuur in combinatie met elleboogdislocatie (let op LUCL/coronoid letsel).',
    clinicalImplication: 'Chirurgische stabilisatie vereist; hoge verdenking op ligamentair en coronoid letsel.',
  },
];

export function getMatchingMasonType(classificationValue: string): MasonTypeDefinition | undefined {
  if (!classificationValue) return undefined;
  const lower = classificationValue.toLowerCase();
  if (lower.includes('type iv') || lower.includes('johnston') || lower.includes('type 4')) {
    return MASON_TYPES.find((t) => t.typeKey === 'type_4');
  }
  if (lower.includes('type iii') || lower.includes('communitief') || lower.includes('type 3')) {
    return MASON_TYPES.find((t) => t.typeKey === 'type_3');
  }
  if (lower.includes('type ii') || lower.includes('wig') || lower.includes('randsegment') || lower.includes('type 2')) {
    return MASON_TYPES.find((t) => t.typeKey === 'type_2');
  }
  if (lower.includes('type i') || lower.includes('niet-verplaatst') || lower.includes('type 1')) {
    return MASON_TYPES.find((t) => t.typeKey === 'type_1');
  }
  return undefined;
}

export const CLINICAL_TREATMENT_GUIDELINES: Record<string, import('../types/ortho').ClinicalTreatmentGuideline> = {
  type_1: {
    masonTypeKey: 'type_1',
    masonTitle: 'Mason Type I (Niet-verplaatst / Minimaal verplaatst)',
    primaryStrategy: 'conservatief',
    strategyTitle: 'Functioneel Conservatief Beleid (Vroege Mobilisatie)',
    summary:
      'Standaardbehandeling is niet-operatief. Doel is het voorkomen van elleboogcontractuur en rotatiestijfheid door snelle actieve oefentherapie binnen 48-72 uur na pijnstilling en eventuele hemartrosaspiratie.',
    recommendations: [
      {
        modality: 'Korte immobilisatie & Vroege Actieve Mobilisatie',
        description:
          'Draagdoek/mitella uitsluitend voor comfort gedurende maximaal 2-3 dagen. Start direct met actieve pronatie, supinatie, flexie en extensie zodra de acute pijn dit toelaat.',
        levelOfEvidence: 'Level I / II (Sterke aanbeveling)',
        suitability: 'Eerste keus',
      },
      {
        modality: 'Diagnostische / Therapeutische Aspiratie Hemartros',
        description:
          'Bij hevige tensiepijn of onzekerheid over mechanische slotklachten kan aspiratie van het hemartros (onder steriele omstandigheden, eventueel met injectie van lokaal anestheticum) worden verricht om pijnvrij bewegingsonderzoek te verifiëren.',
        levelOfEvidence: 'Level II (Consensus)',
        suitability: 'Bij specifieke criteria',
      },
      {
        modality: 'Vermijd Langdurige Gipsspalk',
        description:
          'Gipsimmobilisatie > 7 dagen is gecontra-indiceerd; het leidt tot permanente flexie- en supinatiebeperking zonder voordeel voor anatomische botgenezing.',
        levelOfEvidence: 'Level I (Hoge evidentie)',
        suitability: 'Gecontra-indiceerd bij instabiliteit',
      },
    ],
    criticalDecisionFactors: [
      'Volledig passief bewegingstraject mogelijk na adequate pijnstilling/aspiratie.',
      'Geen mechanische blokkade bij pronatie en supinatie.',
      'Geen begeleidende drukpijn over het mediale collaterale ligament (MCL) of distale radioulnaire gewricht (DRUJ).',
    ],
    evidenceCitations: [
      {
        author: 'Duckworth AD, et al.',
        title: 'Unplaced and minimally displaced fractures of the radial head: a prospective clinical trial.',
        journal: 'J Bone Joint Surg Am',
        year: 2014,
        takeaway: 'Actieve mobilisatie binnen 48 uur resulteert in significant beter bewegingsherstel vergeleken met spalkgips.',
      },
      {
        author: 'Herbertsson P, et al.',
        title: 'Long-term outcome of nonoperatively treated Mason type I fractures of the radial head.',
        journal: 'J Shoulder Elbow Surg',
        year: 2004,
        takeaway: '94% uitstekende langetermijnresultaten bij functioneel conservatief beleid.',
      },
      {
        author: 'Nederlandse Vereniging voor Traumachirurgie (NVT)',
        title: 'Richtlijn Elleboogtrauma — Caput radii fracturen.',
        journal: 'NVT Richtlijnendatabase',
        year: 2020,
        takeaway: 'Mason I fracturen dienen primair functioneel behandeld te worden zonder rigide immobilisatie.',
      },
    ],
    rehabilitationProtocol:
      'Draagdoek 2-3 dagen -> direct starten met actieve onbelaste oefeningen (elleboog buigen/strekken, onderarm draaien) 4-6x per dag -> belasting opbouwen na 4-6 weken na consolidering.',
    contraindications: [
      'Niet conservatief behandelen indien na hemartrosaspiratie een harde mechanische rotatieblokkade persisteert.',
    ],
  },
  type_2: {
    masonTypeKey: 'type_2',
    masonTitle: 'Mason Type II (Verplaatst wig- of randsegment)',
    primaryStrategy: 'orif_versus_conservatief',
    strategyTitle: 'Geïndividualiseerde Afweging: ORIF vs. Conservatief',
    summary:
      'Chirurgische repositie en fixatie (ORIF) is geïndiceerd bij mechanische rotatieblokkade of grote fragmenten (> 25-30% gewrichtsvlak). Bij afwezigheid van rotatieblokkade kan bij kleine verplaatsing (2-4 mm) ook functioneel conservatief worden behandeld.',
    recommendations: [
      {
        modality: 'Open Repositie & Interne Fixatie (ORIF) met Mini-schroeven',
        description:
          'Anatomische repositie en fixatie met 2.0-2.4 mm headless compressieschroeven (of mini-T-plaatje in de anatomische "safe zone"). Herstelt de articulaire congruentie en heft mechanische rotatieblokkade op.',
        levelOfEvidence: 'Level II (Richtlijn consensus)',
        suitability: 'Eerste keus',
      },
      {
        modality: 'Functioneel Conservatief Beleid (bij geselecteerde casus)',
        description:
          'Indien na hemartrosaspiratie en lidocaïnetest geen enkele mechanische weerstand of slotklacht optreedt bij volledige pronatie/supinatie, kan conservatieve behandeling succesvol zijn ondanks > 2 mm verplaatsing op 2D-foto.',
        levelOfEvidence: 'Level II (RCT evidence)',
        suitability: 'Bij specifieke criteria',
      },
    ],
    criticalDecisionFactors: [
      'Aanwezigheid van harde mechanische rotatieblokkade of rotatiebeperking bij lichamelijk onderzoek.',
      'Grootte van het fragment: fragmenten > 30% van het oppervlak dragen axiale belasting en vereisen stabilisatie.',
      'Articulaire step-off: step-off > 2 mm predisponeert voor vroege posttraumatische radio-capitellaire artrose.',
      'Fragmentkwaliteit: mogelijkheid om ten minste twee schroeven met voldoende corticale grip te plaatsen.',
    ],
    evidenceCitations: [
      {
        author: 'Kaas L, et al.',
        title: 'Treatment of Mason type II radial head fractures without mechanical block: a prospective multicenter trial.',
        journal: 'J Bone Joint Surg Am',
        year: 2012,
        takeaway: 'Bij afwezigheid van mechanische blokkade toonde conservatieve behandeling gelijke functionele scores als ORIF.',
      },
      {
        author: 'Hotchkiss RN.',
        title: 'Displaced fractures of the radial head: internal fixation or excision?',
        journal: 'J Am Acad Orthop Surg',
        year: 1997,
        takeaway: 'Fixatie heeft de voorkeur boven excisie bij actieve patiënten ter bescherming van het gewrichtskraakbeen.',
      },
      {
        author: 'AO Trauma Foundation',
        title: 'Surgery Reference — Radial Head: Partial Articular Fracture Fixation.',
        journal: 'AO Surgery Reference',
        year: 2022,
        takeaway: 'Plaatsing van osteosynthesemateriaal strikt in de veilige zone (110° boog) om impingement met de ulna te voorkomen.',
      },
    ],
    rehabilitationProtocol:
      'Na stabiele ORIF: vroege passieve en geleid actieve mobilisatie binnen 48-72 uur. Geen belasting of tillen gedurende 6 weken. Bij conservatief: functioneel op geleide van pijn.',
    contraindications: [
      'Grote osteochondrale defecten zonder stabiele fixatiemogelijkheid.',
      'Ernstige comminutie van het wigsegment waardoor schroeven loslopen.',
    ],
  },
  type_3: {
    masonTypeKey: 'type_3',
    masonTitle: 'Mason Type III (Communitieve / Meerfragmentaire Fractuur)',
    primaryStrategy: 'orif_versus_artroplastiek',
    strategyTitle: 'Radiuskopartroplastiek (Prothese) vs. Complexe Reconstructie',
    summary:
      'Ernstige verbrijzeling van de gehele radiuskop (≥ 3 fragmenten). Bij meer dan 3 fragmenten faalt osteosynthese in > 80% van de gevallen. Modulaire radiuskopartroplastiek (RHP) is de gouden standaard voor stabiliteit van de laterale kolom.',
    recommendations: [
      {
        modality: 'Radiuskopvervanging (Modulaire Prothese / RHP)',
        description:
          'Plaatsing van een modulaire bipolaire of monoblok radiuskopprothese. Herstelt de axiale lengte van het spaakbeen en biedt secundaire valgusstabiliteit, essentieel bij wekedelenletsel.',
        levelOfEvidence: 'Level II (Hoge consensus)',
        suitability: 'Eerste keus',
      },
      {
        modality: 'Complexe Osteosynthese (ORIF)',
        description:
          'Alleen aangewezen indien er 2-3 grote reconstrueerbare hoofdfragmenten zijn zonder subchondrale verbrijzeling of botverlies en zonder devitalisatie van fragmenten.',
        levelOfEvidence: 'Level III',
        suitability: 'Bij specifieke criteria',
      },
      {
        modality: 'Geïsoleerde Radiuskop Resectie',
        description:
          'Enkel te overwegen bij oudere, laag-actieve patiënten met een bewezen stabiele elleboog én bewezen intact MCL, intacte membrana interossea en intacte DRUJ.',
        levelOfEvidence: 'Level III / IV',
        suitability: 'Gecontra-indiceerd bij instabiliteit',
      },
    ],
    criticalDecisionFactors: [
      'Aantal fragmenten op preoperatieve 3D-CT-scan (≥ 3 fragmenten is sterke voorspeller voor non-union/falen van ORIF).',
      'Integriteit van het mediale collaterale ligament (MCL): bij MCL-letsel leidt radiuskopresectie tot ernstige valguskollaps.',
      'Membrana interossea & polsbetrokkenheid: uitsluiten van longitudinaal radio-ulnair dissociatieletsel (Essex-Lopresti).',
      'Botkwaliteit en osteoporose bij indicatiestelling voor prothesiologie.',
    ],
    evidenceCitations: [
      {
        author: 'Ruan HJ, et al.',
        title: 'A randomized controlled trial comparing open reduction and internal fixation with radial head replacement for comminuted fractures.',
        journal: 'J Bone Joint Surg Br',
        year: 2009,
        takeaway: 'Radiuskopartroplastiek gaf significant betere functionele uitkomsten en minder heroperaties dan osteosynthese bij Mason III.',
      },
      {
        author: 'Ring D.',
        title: 'Displaced comminuted fractures of the radial head: to fix or replace?',
        journal: 'J Bone Joint Surg Am',
        year: 2002,
        takeaway: 'ORIF faalt bij > 3 fragmenten door avasculaire necrose, pseudoartrose en postoperatieve contractuur.',
      },
      {
        author: 'van Riet RP, Morrey BF.',
        title: 'Complications after radial head resection: valgus instability and proximal migration.',
        journal: 'Clin Orthop Relat Res',
        year: 2005,
        takeaway: 'Radiuskopresectie is gecontra-indiceerd bij begeleidende ligamentaire instabiliteit.',
      },
    ],
    rehabilitationProtocol:
      'Na radiuskopprothese: vroege actieve flexie/extensie en pronatie/supinatie binnen een stabiel bewegingstraject (vaak 30°-120° in eerste week). Bescherming tegen valgusstress gedurende 6 weken.',
    contraindications: [
      'Radiuskopresectie zonder prothese bij verdenking op MCL- of Essex-Lopresti-letsel.',
      'Overstretching / overstuffing van het capitulum door een te lange prothese.',
    ],
  },
  type_4: {
    masonTypeKey: 'type_4',
    masonTitle: 'Mason Type IV (Radiuskopfractuur met Elleboogluxatie)',
    primaryStrategy: 'stabilisatie_complexe_instabiliteit',
    strategyTitle: 'Chirurgische Elleboogstabilisatie & Ligamentair Herstel',
    summary:
      'Complexe ellebooginstabiliteit (vaak passend binnen het spectrum van de "Terrible Triad"). De radiuskopfractuur moet worden hersteld of vervangen om de laterale pilaar te reconstrueren, gecombineerd met primair herstel van het LUCL en fixatie van een eventuele coronoidfractuur.',
    recommendations: [
      {
        modality: 'Herstel Laterale Kolom (ORIF of Radiuskop Prothese)',
        description:
          'Radiuskopherstel of -vervanging is obligatoir ter herstel van de voorste/laterale botsteun tegen posterolaterale rotatoire subluxatie en valgusbelasting.',
        levelOfEvidence: 'Level II (Richtlijn consensus)',
        suitability: 'Eerste keus',
      },
      {
        modality: 'Ankerrefixatie Lateraal Collateraal Ligament (LUCL)',
        description:
          'Refixatie van het avulsieletsel van het laterale ulnovormige collaterale ligament op het isometrische rotatiepunt van het laterale epicondyl met hechtankers.',
        levelOfEvidence: 'Level II (Consensus)',
        suitability: 'Eerste keus',
      },
      {
        modality: 'Coronoïdfixatie / Kapselhechting',
        description:
          'Fixatie van coronoid processus (tip- of anteromediale facetfractuur) met trekband/schroeven of hechtankers om anterieure stabiliteit te garanderen.',
        levelOfEvidence: 'Level II / III',
        suitability: 'Bij specifieke criteria',
      },
    ],
    criticalDecisionFactors: [
      'Controleer stabiliteit na repositie onder doorlichting: blijft het gewricht stabiel in extensie tot 30 graden?',
      'Identificeer het coronoïdtype conform de O’Driscoll of Regan-Morrey classificatie op 3D-CT.',
      'Nooit een solitaire radiuskopresectie uitvoeren: dit resulteert in onbehandelbare persisterende posterolaterale dislocatie.',
    ],
    evidenceCitations: [
      {
        author: 'McKee MD, et al.',
        title: 'Operative treatment of terrible triad of the elbow: a prospective systematic protocol.',
        journal: 'J Bone Joint Surg Am',
        year: 2005,
        takeaway: 'Gestandaardiseerd protocol (radiuskop + LUCL + coronoid) leidt tot 80% stabiele ellebogen met functionele range of motion.',
      },
      {
        author: 'Morrey BF.',
        title: 'Complex elbow instability: the essential role of the radial head in terrible triad injuries.',
        journal: 'Instr Course Lect',
        year: 2000,
        takeaway: 'De radiuskop is de sleutel tot het voorkomen van recidiverende posterolaterale rotatoire instabiliteit.',
      },
      {
        author: 'Giannicola G, et al.',
        title: 'Radial head prosthesis in complex elbow instability: systematic review and outcome analysis.',
        journal: 'Musculoskelet Surg',
        year: 2012,
        takeaway: 'Modulaire prothesen herstellen de biomechanische congruente stabiliteit effectief.',
      },
    ],
    rehabilitationProtocol:
      'Gelede brace met extensiestop op 30 graden gedurende eerste 2-3 weken ter bescherming van het LUCL; actieve flexie en pronatieoefeningen ter stimulering van de kraakbeennutritie; wekelijks extensie met 10-15° uitbreiden.',
    contraindications: [
      'Geforceerde passieve extensie in de eerste postoperatieve weken.',
      'Conservatieve behandeling bij persisterende gewrichtssubluxatie na repositie.',
    ],
  },
};

export function getClinicalTreatmentGuideline(classificationValue: string): import('../types/ortho').ClinicalTreatmentGuideline {
  const match = getMatchingMasonType(classificationValue);
  const key = match?.typeKey || 'type_3';
  return CLINICAL_TREATMENT_GUIDELINES[key] || CLINICAL_TREATMENT_GUIDELINES.type_3;
}

/**
 * Educational helper for Mason classification guidelines (Mason 1954, Johnston 1962, Hotchkiss 1997).
 * Returns an educational suggestion for clinical verification.
 */
export function suggestMasonClassification(
  features: Partial<FractureFeatures>,
  injuries?: Partial<AssociatedInjuries>
): {
  suggestedType: string;
  rationale: string;
  confidenceNote: string;
} {
  // If there is an associated elbow dislocation -> Mason Type IV (Johnston modification)
  if (injuries?.dislocation === 'present') {
    return {
      suggestedType: 'Type IV (Mason-Johnston)',
      rationale:
        'Aanwezigheid van elleboogluxatie in combinatie met radiuskopfractuur wijst op type IV volgens de Johnston-modificatie.',
      confidenceNote:
        'Suggestie vereist verificatie door specialist; controleer op ligamentaire instabiliteit (LCL/MCL) en coronoidfractuur.',
    };
  }

  // Comminuted / multiple fragments entirely involving head
  if (features?.fragmentation === 'multiple') {
    return {
      suggestedType: 'Type III (Communitief)',
      rationale:
        'Meerfragmentaire / communitieve fractuur van de gehele radiuskop zonder eenvoudig reconstrueerbaar blok.',
      confidenceNote:
        'Beoordeel preoperatieve CT-scan voor aantal fragmenten en geschiktheid voor osteosynthese vs. prothesiologie.',
    };
  }

  // Displacement > 2mm or marginal slice fracture with displacement
  const mm = features?.measuredDisplacementMm;
  const isDisplaced = features?.displacement === 'present' || (typeof mm === 'number' && mm >= 2.0);

  if (isDisplaced) {
    const mmText = mm ? ` (gemeten verplaatsing: ${mm} mm)` : '';
    return {
      suggestedType: 'Type II (Verplaatst wig- of randsegment)',
      rationale: `Partiële fractuur van de radiuskop met verplaatsing > 2 mm of mechanische blokkade${mmText}.`,
      confidenceNote:
        'Onderzoek op rotatiebeperking (pronatie/supinatie) en controleer of reconstructie met mini-schroeven haalbaar is.',
    };
  }

  // Non-displaced or minimal displacement (< 2mm)
  if (features?.displacement === 'absent' || (typeof mm === 'number' && mm < 2.0)) {
    return {
      suggestedType: 'Type I (Niet-verplaatst)',
      rationale:
        'Fissuur of marginale fractuur met verplaatsing < 2 mm en behoud van articulaire congruentie.',
      confidenceNote:
        'Controleer op mechanische slotklachten bij passief bewegingsonderzoek na hemartrosaspiratie.',
    };
  }

  return {
    suggestedType: 'Niet eenduidig te classificeren',
    rationale: 'Onvoldoende fractuurkenmerken ingevoerd om een Mason-type te suggereren.',
    confidenceNote: 'Voer verplaatsing, aantal fragmenten en luxatie-status in.',
  };
}

export interface MasonCriteriaCheck {
  label: string;
  criterionDescription: string;
  currentValueDescription: string;
  matched: boolean;
}

export interface MasonTypeMatchResult {
  typeKey: string;
  shortLabel: string;
  name: string;
  matchesCount: number;
  totalCount: number;
  isRecommended: boolean;
  criteria: MasonCriteriaCheck[];
}

export function evaluateMasonTypeMatch(
  typeDef: MasonTypeDefinition,
  features: Partial<FractureFeatures>,
  injuries?: Partial<AssociatedInjuries>,
  recommendedType?: string
): MasonTypeMatchResult {
  const mm = features?.measuredDisplacementMm;
  const isDisplaced = features?.displacement === 'present' || (typeof mm === 'number' && mm >= 2.0);
  const isComminuted = features?.fragmentation === 'multiple';
  const hasDislocation = injuries?.dislocation === 'present';

  const dispText = typeof mm === 'number' && mm > 0 ? `${mm} mm` : isDisplaced ? '≥ 2 mm' : '< 2 mm';
  const fragText = isComminuted ? '≥3 fragmenten (comminutie)' : '1-2 fragmenten';
  const luxText = hasDislocation ? 'Luxatie aanwezig' : 'Geen luxatie';

  const checks: MasonCriteriaCheck[] = [];

  switch (typeDef.typeKey) {
    case 'type_1':
      checks.push({
        label: 'Verplaatsing',
        criterionDescription: '< 2 mm verplaatsing (of afwezig)',
        currentValueDescription: dispText,
        matched: !isDisplaced,
      });
      checks.push({
        label: 'Fragmentatie',
        criterionDescription: '1 fragment / fissuur / randfissuur',
        currentValueDescription: fragText,
        matched: !isComminuted,
      });
      checks.push({
        label: 'Elleboogstabiliteit',
        criterionDescription: 'Geen geassocieerde elleboogluxatie',
        currentValueDescription: luxText,
        matched: !hasDislocation,
      });
      break;

    case 'type_2':
      checks.push({
        label: 'Verplaatsing',
        criterionDescription: '≥ 2 mm verplaatsing / articulaire step-off',
        currentValueDescription: dispText,
        matched: isDisplaced,
      });
      checks.push({
        label: 'Fragmentatie',
        criterionDescription: '1 - 2 fragmenten (geen comminutie)',
        currentValueDescription: fragText,
        matched: !isComminuted,
      });
      checks.push({
        label: 'Elleboogstabiliteit',
        criterionDescription: 'Geen geassocieerde elleboogluxatie',
        currentValueDescription: luxText,
        matched: !hasDislocation,
      });
      break;

    case 'type_3':
      checks.push({
        label: 'Fragmentatie',
        criterionDescription: '≥ 3 fragmenten (ernstige comminutie)',
        currentValueDescription: fragText,
        matched: isComminuted,
      });
      checks.push({
        label: 'Articulaire integriteit',
        criterionDescription: 'Gehele gewrichtsvlak betrokken',
        currentValueDescription:
          features?.articularInvolvement === 'absent' ? 'Niet articulair' : 'Articulair betrokken',
        matched: features?.articularInvolvement !== 'absent',
      });
      checks.push({
        label: 'Elleboogstabiliteit',
        criterionDescription: 'Geen geassocieerde elleboogluxatie',
        currentValueDescription: luxText,
        matched: !hasDislocation,
      });
      break;

    case 'type_4':
      checks.push({
        label: 'Elleboogdislocatie',
        criterionDescription: 'Elleboogluxatie aanwezig (Johnston-modificatie)',
        currentValueDescription: luxText,
        matched: hasDislocation,
      });
      checks.push({
        label: 'Radiuskopfractuur',
        criterionDescription: 'Aanwezigheid van radiuskopletsel',
        currentValueDescription: 'Aanwezig',
        matched: true,
      });
      checks.push({
        label: 'Ligamentair letsel',
        criterionDescription: 'Complexe instabiliteit / LCL letsel',
        currentValueDescription: hasDislocation ? 'Hoog risico / aanwezig' : 'Niet geverifieerd',
        matched: hasDislocation,
      });
      break;
  }

  const matchesCount = checks.filter((c) => c.matched).length;
  const isRecommended = Boolean(
    recommendedType && getMatchingMasonType(recommendedType)?.typeKey === typeDef.typeKey
  );

  return {
    typeKey: typeDef.typeKey,
    shortLabel: typeDef.shortLabel,
    name: typeDef.name,
    matchesCount,
    totalCount: checks.length,
    isRecommended,
    criteria: checks,
  };
}

/**
 * Validates and sanitizes raw JSON output from Gemini to guarantee adherence to the AIReview interface.
 */
export function validateAIReviewResponse(
  raw: unknown,
  mode: 'sample' | 'live' = 'live'
): { valid: boolean; review: AIReview | null; errors: string[] } {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { valid: false, review: null, errors: ['Geen geldig JSON-object ontvangen'] };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.caseSummary !== 'string' || obj.caseSummary.trim() === '') {
    errors.push('Ontbrekende of ongeldige "caseSummary"');
  }

  if (!Array.isArray(obj.providedFacts)) {
    errors.push('"providedFacts" moet een array zijn');
  }

  if (!Array.isArray(obj.modelInterpretations)) {
    errors.push('"modelInterpretations" moet een array zijn');
  }

  if (!Array.isArray(obj.missingInformation)) {
    errors.push('"missingInformation" moet een array zijn');
  }

  if (!Array.isArray(obj.reviewQuestions)) {
    errors.push('"reviewQuestions" moet een array zijn');
  }

  if (!Array.isArray(obj.uncertainties)) {
    errors.push('"uncertainties" moet een array van strings zijn');
  }

  if (!Array.isArray(obj.limitations)) {
    errors.push('"limitations" moet een array van strings zijn');
  }

  if (typeof obj.disclaimer !== 'string') {
    errors.push('"disclaimer" moet een tekststring zijn');
  }

  if (errors.length > 0) {
    return { valid: false, review: null, errors };
  }

  // Sanitize items with fallback ids
  const sanitized: AIReview = {
    caseSummary: String(obj.caseSummary || ''),
    providedFacts: (obj.providedFacts as any[]).map((f, idx) => ({
      id: String(f.id || `fact-${idx + 1}`),
      text: String(f.text || ''),
      source: ['clinician_entered', 'uploaded_image', 'other_case_input'].includes(f.source)
        ? f.source
        : 'other_case_input',
    })),
    modelInterpretations: (obj.modelInterpretations as any[]).map((interp, idx) => ({
      id: String(interp.id || `interp-${idx + 1}`),
      text: String(interp.text || ''),
      status: ['suggestion', 'uncertain', 'not_assessable'].includes(interp.status)
        ? interp.status
        : 'suggestion',
      basis: String(interp.basis || 'Ingevoerde casusgegevens'),
    })),
    missingInformation: (obj.missingInformation as any[]).map((m, idx) => ({
      id: String(m.id || `missing-${idx + 1}`),
      question: String(m.question || ''),
      reason: String(m.reason || ''),
    })),
    reviewQuestions: (obj.reviewQuestions as any[]).map((q, idx) => ({
      id: String(q.id || `q-${idx + 1}`),
      question: String(q.question || ''),
      category: [
        'imaging',
        'associated_injury',
        'stability',
        'classification',
        'documentation',
      ].includes(q.category)
        ? q.category
        : 'documentation',
    })),
    uncertainties: (obj.uncertainties as any[]).map((u) => String(u)),
    limitations: (obj.limitations as any[]).map((l) => String(l)),
    disclaimer: String(
      obj.disclaimer ||
        'DEMONSTRATIEPROTOTYPE — Dit overzicht is uitsluitend bedoeld voor educatieve en demonstratiedoeleinden.'
    ),
    generatedAt: new Date().toISOString(),
    mode,
  };

  return { valid: true, review: sanitized, errors: [] };
}

/**
 * Initializes clinician review entries for all items in an AIReview.
 */
export function createDefaultClinicianReviews(review: AIReview): ClinicianReview[] {
  const reviews: ClinicianReview[] = [];
  const now = new Date().toISOString();

  // Summary review
  reviews.push({
    itemId: 'summary',
    itemType: 'summary',
    status: 'niet_beoordeeld',
    originalText: review.caseSummary,
    editedText: review.caseSummary,
    note: '',
    updatedAt: now,
  });

  // Provided facts
  for (const fact of review.providedFacts) {
    reviews.push({
      itemId: fact.id,
      itemType: 'fact',
      status: 'niet_beoordeeld',
      originalText: fact.text,
      editedText: fact.text,
      note: '',
      updatedAt: now,
    });
  }

  // Model interpretations
  for (const interp of review.modelInterpretations) {
    reviews.push({
      itemId: interp.id,
      itemType: 'interpretation',
      status: 'niet_beoordeeld',
      originalText: interp.text,
      editedText: interp.text,
      note: '',
      updatedAt: now,
    });
  }

  // Missing info
  for (const missing of review.missingInformation) {
    reviews.push({
      itemId: missing.id,
      itemType: 'missing_info',
      status: 'niet_beoordeeld',
      originalText: missing.question,
      editedText: missing.question,
      note: '',
      updatedAt: now,
    });
  }

  // Review questions
  for (const question of review.reviewQuestions) {
    reviews.push({
      itemId: question.id,
      itemType: 'question',
      status: 'niet_beoordeeld',
      originalText: question.question,
      editedText: question.question,
      note: '',
      updatedAt: now,
    });
  }

  return reviews;
}

/**
 * Merges previous clinician edits into a newly generated review if retainMode is true.
 */
export function mergeOrRetainClinicianReviews(
  previousReviews: ClinicianReview[],
  newReview: AIReview,
  retainMode: boolean
): ClinicianReview[] {
  const freshReviews = createDefaultClinicianReviews(newReview);
  if (!retainMode) {
    return freshReviews;
  }

  const prevMap = new Map<string, ClinicianReview>();
  for (const r of previousReviews) {
    prevMap.set(r.itemId, r);
  }

  return freshReviews.map((fresh) => {
    const existing = prevMap.get(fresh.itemId);
    if (existing && existing.status !== 'niet_beoordeeld') {
      return {
        ...fresh,
        status: existing.status,
        editedText: existing.editedText,
        note: existing.note,
        updatedAt: existing.updatedAt,
      };
    }
    return fresh;
  });
}

/**
 * Dutch status label helper
 */
export function getStatusLabel(status: ReviewItemStatus): string {
  switch (status) {
    case 'beoordeeld':
      return 'Beoordeeld';
    case 'aangepast':
      return 'Aangepast';
    case 'afgewezen':
      return 'Afgewezen';
    case 'niet_beoordeeld':
    default:
      return 'Niet beoordeeld';
  }
}

/**
 * Dutch category label for review questions
 */
export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'imaging':
      return 'Beeldvorming & Aanvullende CT';
    case 'associated_injury':
      return 'Geassocieerd letsel & Wekedelen';
    case 'stability':
      return 'Elleboogstabiliteit & Onderzoek';
    case 'classification':
      return 'Classificatie & Morfologie';
    case 'documentation':
    default:
      return 'Documentatie & Verslaglegging';
  }
}
