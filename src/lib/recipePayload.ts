import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent
} from 'lz-string';

import type {
  EncodedRecipePayloadV2,
  RecipeDraft,
  Result
} from '../types';

const CURRENT_VERSION = 2 as const;

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => normalizeText(entry))
    .filter((entry) => entry.length > 0);
}

function normalizeStarRating(value: unknown): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(5, Math.max(0, Math.round(numericValue)));
}

function normalizeCount(value: unknown): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return 0;
  }

  return Math.floor(numericValue);
}

function sanitizeRecipe(draft: RecipeDraft): RecipeDraft {
  return {
    title: normalizeText(draft.title),
    author: normalizeText(draft.author),
    publishedDate: normalizeText(draft.publishedDate),
    cookingTime: normalizeText(draft.cookingTime),
    starRating: normalizeStarRating(draft.starRating),
    ratingsCount: normalizeCount(draft.ratingsCount),
    commentsCount: normalizeCount(draft.commentsCount),
    blurb: normalizeText(draft.blurb),
    yield: normalizeText(draft.yield),
    ingredients: normalizeList(draft.ingredients),
    steps: normalizeList(draft.steps)
  };
}

function toPayload(draft: RecipeDraft): EncodedRecipePayloadV2 {
  const normalizedDraft = sanitizeRecipe(draft);
  const payload: EncodedRecipePayloadV2 = { v: CURRENT_VERSION };

  if (normalizedDraft.title) {
    payload.t = normalizedDraft.title;
  }

  if (normalizedDraft.author) {
    payload.a = normalizedDraft.author;
  }

  if (normalizedDraft.publishedDate) {
    payload.d = normalizedDraft.publishedDate;
  }

  if (normalizedDraft.cookingTime) {
    payload.c = normalizedDraft.cookingTime;
  }

  if (normalizedDraft.starRating > 0) {
    payload.s = normalizedDraft.starRating;
  }

  if (normalizedDraft.ratingsCount > 0) {
    payload.r = normalizedDraft.ratingsCount;
  }

  if (normalizedDraft.commentsCount > 0) {
    payload.m = normalizedDraft.commentsCount;
  }

  if (normalizedDraft.blurb) {
    payload.b = normalizedDraft.blurb;
  }

  if (normalizedDraft.yield) {
    payload.y = normalizedDraft.yield;
  }

  if (normalizedDraft.ingredients.length > 0) {
    payload.i = normalizedDraft.ingredients;
  }

  if (normalizedDraft.steps.length > 0) {
    payload.p = normalizedDraft.steps;
  }

  return payload;
}

function fromPayload(payload: EncodedRecipePayloadV2): RecipeDraft {
  return {
    title: normalizeText(payload.t),
    author: normalizeText(payload.a),
    publishedDate: normalizeText(payload.d),
    cookingTime: normalizeText(payload.c),
    starRating: normalizeStarRating(payload.s),
    ratingsCount: normalizeCount(payload.r),
    commentsCount: normalizeCount(payload.m),
    blurb: normalizeText(payload.b),
    yield: normalizeText(payload.y),
    ingredients: normalizeList(payload.i),
    steps: normalizeList(payload.p)
  };
}

export function encodeRecipeToHash(draft: RecipeDraft): string {
  const payload = toPayload(draft);
  const compressed = compressToEncodedURIComponent(JSON.stringify(payload));

  return `#r=${compressed}`;
}

export function decodeRecipeFromHash(hash: string): Result<RecipeDraft> {
  const normalizedHash = hash.trim().replace(/^#/, '');

  if (!normalizedHash) {
    return { ok: false, error: 'No recipe payload was provided.' };
  }

  const encodedPayload = normalizedHash.startsWith('r=')
    ? normalizedHash.slice(2)
    : normalizedHash;

  if (!encodedPayload) {
    return { ok: false, error: 'The recipe payload is empty.' };
  }

  const decompressedPayload =
    decompressFromEncodedURIComponent(encodedPayload);

  if (!decompressedPayload) {
    return {
      ok: false,
      error: 'The recipe payload could not be decoded.'
    };
  }

  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(decompressedPayload);
  } catch {
    return {
      ok: false,
      error: 'The recipe payload is not valid JSON.'
    };
  }

  if (
    !parsedPayload ||
    typeof parsedPayload !== 'object' ||
    Array.isArray(parsedPayload)
  ) {
    return {
      ok: false,
      error: 'The recipe payload has an invalid shape.'
    };
  }

  const version = (parsedPayload as { v?: unknown }).v;

  if (version !== CURRENT_VERSION) {
    return {
      ok: false,
      error: 'Unsupported recipe payload version.'
    };
  }

  return {
    ok: true,
    value: fromPayload(parsedPayload as EncodedRecipePayloadV2)
  };
}

export function hasMeaningfulContent(draft: RecipeDraft): boolean {
  const normalizedDraft = sanitizeRecipe(draft);

  return Boolean(
    normalizedDraft.title ||
      normalizedDraft.author ||
      normalizedDraft.publishedDate ||
      normalizedDraft.cookingTime ||
      normalizedDraft.blurb ||
      normalizedDraft.yield ||
      normalizedDraft.ingredients.length > 0 ||
      normalizedDraft.steps.length > 0 ||
      normalizedDraft.starRating > 0 ||
      normalizedDraft.ratingsCount > 0 ||
      normalizedDraft.commentsCount > 0
  );
}
