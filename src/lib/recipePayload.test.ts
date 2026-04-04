import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent
} from 'lz-string';

import { DEFAULT_RECIPE } from './defaultRecipe';
import {
  decodeRecipeFromHash,
  encodeRecipeToHash,
  hasMeaningfulContent
} from './recipePayload';

import type { RecipeDraft } from '../types';

function buildBlankRecipe(): RecipeDraft {
  return {
    title: '',
    author: '',
    publishedDate: '',
    cookingTime: '',
    starRating: 0,
    ratingsCount: 0,
    commentsCount: 0,
    blurb: '',
    yield: '',
    ingredients: [],
    steps: []
  };
}

describe('recipe payload codec', () => {
  it('round-trips a recipe draft through the URL hash', () => {
    const encoded = encodeRecipeToHash(DEFAULT_RECIPE);
    const decoded = decodeRecipeFromHash(encoded);

    expect(decoded).toEqual({
      ok: true,
      value: DEFAULT_RECIPE
    });
  });

  it('omits empty fields from the compact payload', () => {
    const encoded = encodeRecipeToHash({
      ...buildBlankRecipe(),
      title: 'Test recipe',
      ingredients: ['  ', '1 onion'],
      steps: ['Stir.']
    });

    const compressedPayload = encoded.replace(/^#r=/, '');
    const jsonPayload = decompressFromEncodedURIComponent(compressedPayload);

    expect(jsonPayload).not.toBeNull();

    const parsedPayload = JSON.parse(jsonPayload as string);

    expect(parsedPayload).toEqual({
      v: 2,
      t: 'Test recipe',
      i: ['1 onion'],
      p: ['Stir.']
    });
  });

  it('clamps and normalizes numeric fields', () => {
    const encoded = encodeRecipeToHash({
      ...DEFAULT_RECIPE,
      starRating: 8.27,
      ratingsCount: -44,
      commentsCount: 18.9
    });

    const decoded = decodeRecipeFromHash(encoded);

    expect(decoded).toEqual({
      ok: true,
      value: {
        ...DEFAULT_RECIPE,
        starRating: 5,
        ratingsCount: 0,
        commentsCount: 18
      }
    });
  });

  it('rounds fractional star ratings to whole numbers', () => {
    const encoded = encodeRecipeToHash({
      ...DEFAULT_RECIPE,
      starRating: 4.2
    });

    const decoded = decodeRecipeFromHash(encoded);

    expect(decoded).toEqual({
      ok: true,
      value: {
        ...DEFAULT_RECIPE,
        starRating: 4
      }
    });
  });

  it('handles invalid hashes safely', () => {
    expect(decodeRecipeFromHash('#r=not-a-real-payload')).toEqual({
      ok: false,
      error: 'The recipe payload could not be decoded.'
    });
  });

  it('rejects unsupported payload versions', () => {
    const compressedPayload = compressToEncodedURIComponent(
      JSON.stringify({ v: 1, t: 'Old payload' })
    );

    expect(decodeRecipeFromHash(`#r=${compressedPayload}`)).toEqual({
      ok: false,
      error: 'Unsupported recipe payload version.'
    });
  });

  it('reports whether a draft has meaningful shareable content', () => {
    expect(hasMeaningfulContent(buildBlankRecipe())).toBe(false);
    expect(
      hasMeaningfulContent({
        ...buildBlankRecipe(),
        title: 'One useful field'
      })
    ).toBe(true);
  });
});
