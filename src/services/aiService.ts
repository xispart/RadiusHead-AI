/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Case, AIReview } from '../types/ortho';
import { validateAIReviewResponse } from '../utils/orthoRules';
import { DEMO_AI_REVIEW } from '../data/demoCase';

export interface AIReviewResult {
  success: boolean;
  review: AIReview | null;
  error?: string;
  isFallback?: boolean;
}

/**
 * Loads the prewritten, deterministic example review from local application code.
 * Guaranteed to succeed without external network or API dependencies.
 */
export function getDeterministicSampleReview(): AIReview {
  return {
    ...DEMO_AI_REVIEW,
    generatedAt: new Date().toISOString(),
    mode: 'sample',
  };
}

/**
 * Executes a real server-side Gemini request for the case.
 */
export async function requestLiveAIReview(
  caseData: Case,
  imageBase64?: string | null,
  imageMimeType?: string
): Promise<AIReviewResult> {
  try {
    const res = await fetch('/api/gemini/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caseData: {
          id: caseData.id,
          title: caseData.title,
          clinicalContext: caseData.clinicalContext,
          imagingInput: {
            modality: caseData.imagingInput.modality,
            sourceType: caseData.imagingInput.sourceType,
            observations: caseData.imagingInput.observations,
          },
          fractureFeatures: caseData.fractureFeatures,
          associatedInjuries: caseData.associatedInjuries,
        },
        imageBase64: imageBase64 || undefined,
        imageMimeType: imageMimeType || 'image/png',
      }),
    });

    if (!res.ok) {
      let errText = `Serverfout (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson.error) {
          errText = errJson.error;
        }
      } catch {
        // ignore parse error
      }
      return {
        success: false,
        review: null,
        error: errText,
      };
    }

    const data = await res.json();
    if (!data.success || !data.review) {
      return {
        success: false,
        review: null,
        error: data.error || 'Geen geldig antwoord ontvangen van de AI-service.',
      };
    }

    const validation = validateAIReviewResponse(data.review, 'live');
    if (!validation.valid || !validation.review) {
      return {
        success: false,
        review: null,
        error: `De AI-respons voldeed niet aan het strikte schema: ${validation.errors.join(', ')}`,
      };
    }

    return {
      success: true,
      review: validation.review,
    };
  } catch (err: any) {
    return {
      success: false,
      review: null,
      error: `Netwerk- of verbindingsfout: ${err?.message || 'Kan server niet bereiken'}`,
    };
  }
}
