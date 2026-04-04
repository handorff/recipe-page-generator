export interface RecipeDraft {
  title: string;
  author: string;
  publishedDate: string;
  cookingTime: string;
  starRating: number;
  ratingsCount: number;
  commentsCount: number;
  blurb: string;
  yield: string;
  ingredients: string[];
  steps: string[];
}

export interface EncodedRecipePayloadV2 {
  v: 2;
  t?: string;
  a?: string;
  d?: string;
  c?: string;
  s?: number;
  r?: number;
  m?: number;
  b?: string;
  y?: string;
  i?: string[];
  p?: string[];
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type AppMode = 'edit' | 'share';
