/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClinicalSide = 'left' | 'right' | 'unknown';

export interface ClinicalContext {
  ageBand: string | null;
  side: ClinicalSide;
  injuryMechanism: string;
  timeSinceInjury: string;
  notes: string;
}

export type ImagingModality = 'none' | 'xray' | 'ct' | 'other';
export type ImagingSourceType = 'none' | 'manual' | 'uploaded_image';

export interface ImagingInput {
  modality: ImagingModality;
  sourceType: ImagingSourceType;
  imageName: string | null;
  imageAvailable: boolean;
  imageDataUrl?: string | null; // client-side in-memory base64 preview only
  observations: string;
}

export type FeaturePresence = 'not_assessed' | 'absent' | 'present' | 'uncertain';
export type StabilityRating = 'not_assessed' | 'stable' | 'unstable' | 'uncertain';
export type FragmentationRating = 'not_assessed' | 'limited' | 'multiple';
export type ClassificationSource = 'clinician-entered' | 'ai-suggested' | 'not-assessed';

export interface FractureFeatures {
  fragmentation: FragmentationRating;
  articularInvolvement: FeaturePresence;
  displacement: FeaturePresence;
  measuredDisplacementMm: number | null;
  stability: StabilityRating;
  classificationValue: string; // e.g., 'Type I', 'Type II', 'Type III', 'Type IV'
  classificationSource: ClassificationSource;
}

export interface AssociatedInjuries {
  dislocation: FeaturePresence;
  coronoid: FeaturePresence;
  ligamentConcern: FeaturePresence;
  otherFindings: string;
}

export type FactSource = 'clinician_entered' | 'uploaded_image' | 'other_case_input';

export interface ProvidedFact {
  id: string;
  text: string;
  source: FactSource;
}

export type InterpretationStatus = 'suggestion' | 'uncertain' | 'not_assessable';

export interface ModelInterpretation {
  id: string;
  text: string;
  status: InterpretationStatus;
  basis: string;
}

export interface MissingInformationItem {
  id: string;
  question: string;
  reason: string;
}

export type QuestionCategory =
  | 'imaging'
  | 'associated_injury'
  | 'stability'
  | 'classification'
  | 'documentation';

export interface ReviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
}

export interface AIReview {
  caseSummary: string;
  providedFacts: ProvidedFact[];
  modelInterpretations: ModelInterpretation[];
  missingInformation: MissingInformationItem[];
  reviewQuestions: ReviewQuestion[];
  uncertainties: string[];
  limitations: string[];
  disclaimer: string;
  generatedAt?: string;
  mode: 'sample' | 'live';
}

export type ReviewItemStatus =
  | 'niet_beoordeeld'
  | 'beoordeeld'
  | 'aangepast'
  | 'afgewezen';

export interface ClinicianReview {
  itemId: string;
  itemType: 'fact' | 'interpretation' | 'missing_info' | 'question' | 'summary';
  status: ReviewItemStatus;
  originalText: string;
  editedText: string;
  note: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  title: string;
  demoMode: boolean;
  createdAt: string;
  status: 'nieuw' | 'in_bewerking' | 'beoordeeld';
  clinicalContext: ClinicalContext;
  imagingInput: ImagingInput;
  fractureFeatures: FractureFeatures;
  associatedInjuries: AssociatedInjuries;
  aiReview: AIReview | null;
  clinicianReview: ClinicianReview[];
  reportVersion: number;
}
