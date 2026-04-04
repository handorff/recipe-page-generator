import { useEffect, useState } from 'react';

import type { AppMode } from '../types';

interface EditableRatingProps {
  mode: AppMode;
  onCommit: (value: number) => void;
  value: number;
}

function buildStars(value: number): string {
  const rounded = Math.round(value);

  return Array.from({ length: 5 }, (_, index) =>
    index < rounded ? '★' : '☆'
  ).join('');
}

function formatRatingValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
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
      setDraftValue(value);
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
              setDraftValue(Number.parseFloat(event.target.value))
            }
            step="0.1"
            type="range"
            value={draftValue}
          />
          <input
            aria-label="Numeric star rating"
            className="rating-input"
            max="5"
            min="0"
            onChange={(event) =>
              setDraftValue(Number.parseFloat(event.target.value) || 0)
            }
            step="0.1"
            type="number"
            value={draftValue}
          />
          <button
            className="mini-action"
            onClick={() => {
              onCommit(draftValue);
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
