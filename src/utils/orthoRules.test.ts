/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  suggestMasonClassification,
  validateAIReviewResponse,
  createDefaultClinicianReviews,
  mergeOrRetainClinicianReviews,
} from './orthoRules';
import { AIReview, ClinicianReview } from '../types/ortho';

test('suggestMasonClassification correctly identifies Type IV with dislocation', () => {
  const result = suggestMasonClassification(
    { fragmentation: 'limited', displacement: 'present', measuredDisplacementMm: 2.5 },
    { dislocation: 'present' }
  );
  assert.equal(result.suggestedType, 'Type IV (Mason-Johnston)');
  assert.ok(result.rationale.includes('elleboogluxatie'));
});

test('suggestMasonClassification identifies Type III for comminuted fractures', () => {
  const result = suggestMasonClassification(
    { fragmentation: 'multiple', displacement: 'present', measuredDisplacementMm: 4.0 },
    { dislocation: 'absent' }
  );
  assert.equal(result.suggestedType, 'Type III (Communitief)');
});

test('suggestMasonClassification identifies Type II for displaced non-comminuted', () => {
  const result = suggestMasonClassification(
    { fragmentation: 'limited', displacement: 'present', measuredDisplacementMm: 3.0 },
    { dislocation: 'absent' }
  );
  assert.equal(result.suggestedType, 'Type II (Verplaatst wig- of randsegment)');
});

test('suggestMasonClassification identifies Type I for non-displaced fractures', () => {
  const result = suggestMasonClassification(
    { fragmentation: 'limited', displacement: 'absent', measuredDisplacementMm: 0 },
    { dislocation: 'absent' }
  );
  assert.equal(result.suggestedType, 'Type I (Niet-verplaatst)');
});

test('validateAIReviewResponse validates complete contract properly', () => {
  const sampleRaw = {
    caseSummary: 'Test samenvatting',
    providedFacts: [{ id: 'f-1', text: 'Rechterarm letsel', source: 'clinician_entered' }],
    modelInterpretations: [
      { id: 'i-1', text: 'Mogelijk Type II', status: 'suggestion', basis: 'Röntgen' },
    ],
    missingInformation: [
      { id: 'm-1', question: 'Is er elleboogsubluxatie?', reason: 'Stabiliteitsbeoordeling' },
    ],
    reviewQuestions: [
      { id: 'q-1', question: 'Is een 3D-CT geïndiceerd?', category: 'imaging' },
    ],
    uncertainties: ['Nauwkeurigheid van 2D-opname bij communitieve fragmenten'],
    limitations: ['Geen directe ligamentaire beoordeling mogelijk'],
    disclaimer: 'Voorbeeld disclaimer',
  };

  const validation = validateAIReviewResponse(sampleRaw, 'sample');
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
  assert.equal(validation.review?.caseSummary, 'Test samenvatting');
  assert.equal(validation.review?.mode, 'sample');
});

test('validateAIReviewResponse rejects missing required arrays', () => {
  const invalidRaw = {
    caseSummary: 'Test',
    providedFacts: 'not-an-array',
  };
  const validation = validateAIReviewResponse(invalidRaw, 'live');
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.length > 0);
});

test('createDefaultClinicianReviews initializes all items with "niet_beoordeeld"', () => {
  const dummyReview: AIReview = {
    caseSummary: 'Summary text',
    providedFacts: [{ id: 'f1', text: 'Fact 1', source: 'clinician_entered' }],
    modelInterpretations: [{ id: 'i1', text: 'Interp 1', status: 'suggestion', basis: 'Basis 1' }],
    missingInformation: [{ id: 'm1', question: 'Missing 1', reason: 'Reason 1' }],
    reviewQuestions: [{ id: 'q1', question: 'Q 1', category: 'imaging' }],
    uncertainties: [],
    limitations: [],
    disclaimer: 'Disclaimer',
    mode: 'sample',
  };

  const reviews = createDefaultClinicianReviews(dummyReview);
  assert.equal(reviews.length, 5); // 1 summary + 1 fact + 1 interp + 1 missing + 1 question
  assert.ok(reviews.every((r) => r.status === 'niet_beoordeeld'));
});

test('mergeOrRetainClinicianReviews preserves existing edits when retainMode is true', () => {
  const dummyReview: AIReview = {
    caseSummary: 'New summary text',
    providedFacts: [{ id: 'f1', text: 'Fact 1', source: 'clinician_entered' }],
    modelInterpretations: [{ id: 'i1', text: 'Interp 1', status: 'suggestion', basis: 'Basis 1' }],
    missingInformation: [],
    reviewQuestions: [],
    uncertainties: [],
    limitations: [],
    disclaimer: 'Disclaimer',
    mode: 'live',
  };

  const previousReviews: ClinicianReview[] = [
    {
      itemId: 'i1',
      itemType: 'interpretation',
      status: 'aangepast',
      originalText: 'Old interp',
      editedText: 'Clinician edited interp text',
      note: 'Verified with supervisor',
      updatedAt: '2026-10-26T00:00:00Z',
    },
  ];

  const merged = mergeOrRetainClinicianReviews(previousReviews, dummyReview, true);
  const interpItem = merged.find((r) => r.itemId === 'i1');
  assert.equal(interpItem?.status, 'aangepast');
  assert.equal(interpItem?.editedText, 'Clinician edited interp text');
  assert.equal(interpItem?.note, 'Verified with supervisor');
});

test('getMatchingMasonType correctly matches classification strings', async () => {
  const { getMatchingMasonType, MASON_TYPES } = await import('./orthoRules');
  assert.equal(MASON_TYPES.length, 4);
  assert.equal(getMatchingMasonType('Type I (Niet-verplaatst)')?.typeKey, 'type_1');
  assert.equal(getMatchingMasonType('Type II (Verplaatst wig- of randsegment)')?.typeKey, 'type_2');
  assert.equal(getMatchingMasonType('Type III (Communitief)')?.typeKey, 'type_3');
  assert.equal(getMatchingMasonType('Type IV (Mason-Johnston)')?.typeKey, 'type_4');
  assert.equal(getMatchingMasonType('Onbekend'), undefined);
});

test('getClinicalTreatmentGuideline returns accurate evidence-based guidelines for each Mason type', async () => {
  const { getClinicalTreatmentGuideline } = await import('./orthoRules');
  const g1 = getClinicalTreatmentGuideline('Type I (Niet-verplaatst)');
  assert.equal(g1.primaryStrategy, 'conservatief');
  assert.ok(g1.recommendations.length > 0);
  assert.ok(g1.evidenceCitations.some((c) => c.author.includes('Duckworth')));

  const g2 = getClinicalTreatmentGuideline('Type II (Verplaatst wig- of randsegment)');
  assert.equal(g2.primaryStrategy, 'orif_versus_conservatief');
  assert.ok(g2.criticalDecisionFactors.some((f) => f.includes('rotatieblokkade')));

  const g3 = getClinicalTreatmentGuideline('Type III (Communitief)');
  assert.equal(g3.primaryStrategy, 'orif_versus_artroplastiek');
  assert.ok(g3.recommendations.some((r) => r.modality.includes('Radiuskopvervanging')));

  const g4 = getClinicalTreatmentGuideline('Type IV (Mason-Johnston)');
  assert.equal(g4.primaryStrategy, 'stabilisatie_complexe_instabiliteit');
  assert.ok(g4.evidenceCitations.some((c) => c.author.includes('McKee')));
});

test('evaluateMasonTypeMatch correctly scores and explains criteria matches against case features', async () => {
  const { evaluateMasonTypeMatch, MASON_TYPES } = await import('./orthoRules');

  // Case with comminuted fracture, 3.2mm displacement, no dislocation
  const comminutedFeatures = {
    fragmentation: 'multiple' as const,
    displacement: 'present' as const,
    measuredDisplacementMm: 3.2,
    articularInvolvement: 'present' as const,
  };
  const noInjuries = { dislocation: 'absent' as const };

  const type1Match = evaluateMasonTypeMatch(MASON_TYPES[0], comminutedFeatures, noInjuries, 'Type III');
  assert.equal(type1Match.matchesCount, 1); // Only dislocation is absent matches; fragmentation and displacement fail

  const type3Match = evaluateMasonTypeMatch(MASON_TYPES[2], comminutedFeatures, noInjuries, 'Type III (Communitief)');
  assert.equal(type3Match.matchesCount, 3); // All 3 match!
  assert.equal(type3Match.isRecommended, true);

  // Case with dislocation
  const dislocationInjuries = { dislocation: 'present' as const };
  const type4Match = evaluateMasonTypeMatch(MASON_TYPES[3], comminutedFeatures, dislocationInjuries, 'Type IV');
  assert.equal(type4Match.matchesCount, 3);
  assert.equal(type4Match.isRecommended, true);
});

