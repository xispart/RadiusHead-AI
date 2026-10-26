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
