/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Case, AIReview } from '../types/ortho';
import { createDefaultClinicianReviews } from '../utils/orthoRules';

export const DEMO_AI_REVIEW: AIReview = {
  mode: 'sample',
  caseSummary:
    'Casus betreft een 42-jarige fietser met een verplaatste, comminutieve fractuur van het caput radii rechts na een val op uitgestrekte hand (FOOSH). Er is sprake van gewrichtsoppervlakbetrokkenheid met een geschatte articulaire verplaatsing van 3.2 mm en ten minste 3 identificeerbare fragmenten. Klinisch vermoeden van Mason Type III. Geen directe aanwijzing voor elleboogluxatie in de initiële rapportage, echter ligamentaire integriteit (LUCL/MCL) en coronoid-status behoeven formele uitsluiting.',
  providedFacts: [
    {
      id: 'fact-1',
      text: 'Leeftijdscategorie 40-49 jaar, trauma aan de rechterelleboog door hoogenergetische val met de fiets.',
      source: 'clinician_entered',
    },
    {
      id: 'fact-2',
      text: 'Tijd sinds trauma bedraagt circa 18 uur met acute pijn, zwelling en bewegingsbeperking (pronatie/supinatie geblokkeerd).',
      source: 'clinician_entered',
    },
    {
      id: 'fact-3',
      text: 'Conventionele röntgenopnames tonen multipele corticale onderbrekingen van het caput radii met een gemeten verplaatsing van circa 3.2 mm.',
      source: 'uploaded_image',
    },
    {
      id: 'fact-4',
      text: 'Geen grove elleboogdislocatie gerapporteerd op de initiële opnames.',
      source: 'clinician_entered',
    },
  ],
  modelInterpretations: [
    {
      id: 'interp-1',
      text: 'Morfologisch patroon is consistent met een Mason Type III fractuur (meerfragmentair en verplaatst).',
      status: 'suggestion',
      basis: 'Aanwezigheid van multipele fragmenten en > 2 mm articulaire verplaatsing.',
    },
    {
      id: 'interp-2',
      text: 'Verhoogd risico op bijkomend letsel van het laterale ulnovormige collaterale ligament (LUCL) of processus coronoideus fractuur (terrible triad suspectie).',
      status: 'uncertain',
      basis: 'Traumamechanisme (val op hand met valgus- en supinatiekracht) en comminutiegraad.',
    },
    {
      id: 'interp-3',
      text: 'Gewrichtsstabiliteit bij valgusstress en passieve rotatie kan niet betrouwbaar virtueel worden bepaald zonder lichamelijk onderzoek onder verdoving of dynamische doorlichting.',
      status: 'not_assessable',
      basis: 'Beperking van statische gegevens en ontbreken van stresstesten.',
    },
  ],
  missingInformation: [
    {
      id: 'miss-1',
      question: 'Is er een 3D-CT-scan verricht met reconstructies ter beoordeling van fragmentgrootte en articulair dragend oppervlak?',
      reason: 'Essentieel voor de preoperatieve afweging tussen open reductie en interne fixatie (ORIF) versus radiuskopprothese (RHP).',
    },
    {
      id: 'miss-2',
      question: 'Is er palpatiepijn of drukpijn aan het distale radioulnaire gewricht (DRUJ) of de membrana interossea?',
      reason: 'Noodzakelijk ter uitsluiting van een longitudinaal radioulnair dissociatieletsel (Essex-Lopresti letsel), waarbij resectie van de radiuskop gecontra-indiceerd is.',
    },
    {
      id: 'miss-3',
      question: 'Wat is de exacte toestand van de processus coronoideus (anteromediale facet en tip)?',
      reason: 'Een niet-herkende coronoïdfractuur leidt bij radiuskopletsel tot ernstige posterolaterale rotatoire instabiliteit.',
    },
  ],
  reviewQuestions: [
    {
      id: 'revq-1',
      question: 'Zijn de fragmenten groot genoeg (> 25-30% van het radiuskopopperlak) en van voldoende botkwaliteit voor stabiele schroeffixatie zonder impingement in de incisura radialis?',
      category: 'classification',
    },
    {
      id: 'revq-2',
      question: 'Is er sprake van een mechanische slotstand of rotatieblokkade na hematoma-aspiratie/lokale verdoving?',
      category: 'stability',
    },
    {
      id: 'revq-3',
      question: 'Is een preoperatieve CT-scan geïndiceerd vóór definitieve indicatiestelling?',
      category: 'imaging',
    },
    {
      id: 'revq-4',
      question: 'Welke klinische testen zijn uitgevoerd ter beoordeling van het mediaal collateraal ligament (MCL) en het distale radioulnair gewricht?',
      category: 'associated_injury',
    },
  ],
  uncertainties: [
    'Fragmentgrootte en subchondrale comminutie kunnen op 2D-röntgen ernstig worden onderschat ten opzichte van CT.',
    'Ligamentaire integriteit (LUCL/MCL complex) kan niet worden vastgesteld op basis van conventionele beelden.',
    'De actuele mechanische stabiliteit bij valgus- en varusstress is onbekend.',
  ],
  limitations: [
    'Geen patiëntspecifieke 3D-volumetrie beschikbaar in dit prototype.',
    'AI-classificatie is een patroonsuggestie en mag niet als definitief klinisch oordeel worden beschouwd.',
    'Geen behandeladvies: keuze tussen conservatief, osteosynthese of artroplastiek dient te geschieden door de behandelend traumachirurg/orthopedisch chirurg.',
  ],
  disclaimer:
    'DEMONSTRATIEPROTOTYPE — NIET VOOR KLINISCHE BESLUITVORMING. Dit overzicht is uitsluitend gecreëerd voor educatieve casusbespreking tijdens orthopedische conferenties. Fictieve casusgegevens.',
  generatedAt: '2026-10-26T08:30:00.000Z',
};

export const INITIAL_DEMO_CASE: Case = {
  id: 'RH-001',
  title: 'Demo RH-001 — Meerfragmentaire radiuskopfractuur',
  demoMode: true,
  createdAt: '2026-10-26T08:00:00.000Z',
  status: 'beoordeeld',
  clinicalContext: {
    ageBand: '40-49',
    side: 'right',
    injuryMechanism: 'Val op uitgestrekte hand (FOOSH) tijdens het wielrennen met valguskracht op de elleboog.',
    timeSinceInjury: '18 uur geleden',
    notes: 'Patiënt presenteerde zich op de SEH met hevige pijn lateraal aan de rechterelleboog, forse zwelling en totale blokkade van pronatie en supinatie. Neurovasculair distaal intact (radialis, medianus, ulnaris sensibel en motorisch intact, a. radialis krachtig palpabel).',
  },
  imagingInput: {
    modality: 'xray',
    sourceType: 'manual',
    imageName: 'fictieve_roentgen_ap_lat_demo.png',
    imageAvailable: true,
    observations: 'Conventionele opnames (AP en lateraal) tonen een verplaatste comminutieve fractuur van het anterolaterale en posterolaterale segment van het caput radii. Articulaire step-off geschat op > 3 mm. Geen grove elleboogdislocatie. Processus coronoideus toont geen grove afwijking op 2D, maar overprojectie sluit microfractuur niet uit.',
  },
  fractureFeatures: {
    fragmentation: 'multiple',
    articularInvolvement: 'present',
    displacement: 'present',
    measuredDisplacementMm: 3.2,
    stability: 'uncertain',
    classificationValue: 'Type III (Communitief)',
    classificationSource: 'ai-suggested',
  },
  associatedInjuries: {
    dislocation: 'absent',
    coronoid: 'uncertain',
    ligamentConcern: 'present',
    otherFindings: 'Drukpijn ter hoogte van het laterale collaterale ligamentcomplex; geen drukpijn aan de distale ulna/DRUJ. Geen aanwijzingen voor compartimentsyndroom.',
  },
  aiReview: DEMO_AI_REVIEW,
  clinicianReview: createDefaultClinicianReviews(DEMO_AI_REVIEW),
  reportVersion: 1,
};

export function createBlankCase(): Case {
  return {
    id: `RH-${Math.floor(100 + Math.random() * 900)}`,
    title: 'Nieuwe casus — Radiuskopfractuur',
    demoMode: false,
    createdAt: new Date().toISOString(),
    status: 'nieuw',
    clinicalContext: {
      ageBand: null,
      side: 'unknown',
      injuryMechanism: '',
      timeSinceInjury: '',
      notes: '',
    },
    imagingInput: {
      modality: 'none',
      sourceType: 'none',
      imageName: null,
      imageAvailable: false,
      observations: '',
    },
    fractureFeatures: {
      fragmentation: 'not_assessed',
      articularInvolvement: 'not_assessed',
      displacement: 'not_assessed',
      measuredDisplacementMm: null,
      stability: 'not_assessed',
      classificationValue: 'Niet beoordeeld',
      classificationSource: 'not-assessed',
    },
    associatedInjuries: {
      dislocation: 'not_assessed',
      coronoid: 'not_assessed',
      ligamentConcern: 'not_assessed',
      otherFindings: '',
    },
    aiReview: null,
    clinicianReview: [],
    reportVersion: 1,
  };
}
