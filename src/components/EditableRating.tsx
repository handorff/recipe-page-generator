import { useEffect, useState } from 'react';

import type { AppMode } from '../types';

interface EditableRatingProps {
  mode: AppMode;
  onCommit: (value: number) => void;
  value: number;
}

function normalizeRating(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(5, Math.max(0, Math.round(value)));
}

function buildStars(value: number): string {
  const rounded = normalizeRating(value);

  return Array.from({ length: 5 }, (_, index) =>
    index < rounded ? '★' : '☆'
  ).join('');
}

function formatRatingValue(value: number): string {
  return String(normalizeRating(value));
}

export function EditableRating({
  mode,
  onCommit,
  value
}: EditableRatingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(normalizeRating(value));
    }
  }, [isEditing, value]);

  const ratingText = formatRatingValue(value);
  const ratingLabel = `${ratingText} out of 5`;

  if (mode === 'share') {
    return (
      <div className="rating-summary" aria-label={`Rating ${ratingLabel}`}>
        <span className="rating-number">{ratingText}</span>
        <span className="rating-stars" aria-hidden="true">
          {buildStars(value)}
        </span>
      </div>
    );
  }

  return (
    <div className={`rating-shell ${isEditing ? 'is-editing' : ''}`}>
      {isEditing ? (
        <div className="rating-editor">
          <label className="sr-only" htmlFor="star-rating-range">
            Star rating
          </label>
          <input
            aria-label="Star rating"
            className="rating-range"
            id="star-rating-range"
            max="5"
            min="0"
            onChange={(event) =>
              setDraftValue(normalizeRating(Number.parseInt(event.target.value, 10)))
            }
            step="1"
            type="range"
            value={draftValue}
          />
          <input
            aria-label="Numeric star rating"
            className="rating-input"
            max="5"
            min="0"
            onChange={(event) =>
              setDraftValue(normalizeRating(Number.parseInt(event.target.value, 10)))
            }
            step="1"
            type="number"
            value={draftValue}
          />
          <button
            className="mini-action"
            onClick={() => {
              onCommit(normalizeRating(draftValue));
              setIsEditing(false);
            }}
            type="button"
          >
            Done
          </button>
        </div>
      ) : (
        <button
          aria-label="Star rating"
          className="inline-trigger rating-trigger"
          onClick={() => setIsEditing(true)}
          onFocus={() => setIsEditing(true)}
          type="button"
        >
          <span className="rating-number">{ratingText}</span>
          <span className="rating-stars" aria-hidden="true">
            {buildStars(value)}
          </span>
        </button>
      )}
    </div>
  );
}
