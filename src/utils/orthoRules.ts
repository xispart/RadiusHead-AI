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
