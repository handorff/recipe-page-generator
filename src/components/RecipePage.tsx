import { useEffect, useState } from 'react';

import { EditableField } from './EditableField';
import { EditableRating } from './EditableRating';

import type { AppMode, RecipeDraft } from '../types';

interface RecipePageProps {
  canShare: boolean;
  disclaimerText: string;
  editUrl: string;
  hasAcknowledgedDisclaimer: boolean;
  loadError: string | null;
  mode: AppMode;
  onAcknowledgeDisclaimer: () => void;
  onAddIngredient: () => void;
  onAddStep: () => void;
  onClearLoadError: () => void;
  onCopyShareUrl: () => void;
  onRemoveIngredient: (index: number) => void;
  onRemoveStep: (index: number) => void;
  onReorderIngredient: (index: number, direction: -1 | 1) => void;
  onReorderStep: (index: number, direction: -1 | 1) => void;
  onUpdateField: <K extends keyof RecipeDraft>(
    field: K,
    value: RecipeDraft[K]
  ) => void;
  onUpdateIngredient: (index: number, value: string) => void;
  onUpdateStep: (index: number, value: string) => void;
  recipe: RecipeDraft;
  shareState: 'copied' | 'error' | 'idle';
  shareUrl: string;
}

function formatDate(dateString: string): string {
  if (!dateString) {
    return '';
  }

  const parsedDate = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(parsedDate);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function SaveIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 20">
      <path
        d="M14.706 4.294H6.294v10.587l4.206-2.669 4.206 2.67V4.293ZM5 3h11v14.235l-5.5-3.49-5.5 3.49V3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg fill="none" viewBox="0 0 25 20">
      <path
        d="M18.29 5.42h-2.32a3.18 3.18 0 0 0 .05-3.37A3.1 3.1 0 0 0 13.96.68a3.52 3.52 0 0 0-2.5.48 3.86 3.86 0 0 0-1.55 2.37 3.79 3.79 0 0 0-1.55-2.37A3.49 3.49 0 0 0 5.87.68a3.08 3.08 0 0 0-2.06 1.37 3.16 3.16 0 0 0 0 3.37H1.54a1 1 0 0 0-.94.95v3.64a1 1 0 0 0 .94.95h.23v7.24a1.16 1.16 0 0 0 1.15 1.15h14a1.15 1.15 0 0 0 1.14-1.15v-7.24h.23a1 1 0 0 0 1-.95V6.37a1 1 0 0 0-1-.95Zm-1.73 5.59v6.84h-5.9v-6.84h5.9Zm-5.44-5.82.17-1.13a2.47 2.47 0 0 1 1-1.65 2 2 0 0 1 1.41-.28 1.65 1.65 0 0 1 1.08.72 1.78 1.78 0 0 1-.53 2.31l-3.13.03Zm6.61 1.73v2.54h-7.07V6.92h7.07Zm-8.57 4.09v6.84H3.29v-6.84h5.87ZM5.08 2.85a1.6 1.6 0 0 1 1.07-.72 2 2 0 0 1 1.41.28A2.37 2.37 0 0 1 8.49 4l.21 1.19H5.61a1.77 1.77 0 0 1-.53-2.34Zm4.08 4.07v2.54H2.1V6.92h7.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg fill="none" viewBox="0 0 23 20">
      <path
        d="M1.79 17.31a.691.691 0 0 1-.25 0 .82.82 0 0 1-.56-1C2.79 8.76 6.92 4.78 12.79 5.07V1.89a1 1 0 0 1 .51-.81.89.89 0 0 1 1 .12l7.8 6.65a1 1 0 0 1 .31.68 1 1 0 0 1-.31.68l-7.8 6.6a.92.92 0 0 1-.94.13.88.88 0 0 1-.52-.81v-3.41c-7.66-.75-10 4.83-10.15 5.07a.83.83 0 0 1-.9.52Zm9.59-7.3c.746.002 1.491.055 2.23.16a1 1 0 0 1 .78.88v2.44l5.86-5-5.86-5v2.4a.88.88 0 0 1-1 .88c-4.2-.47-7.38 1.48-9.36 5.66a11.44 11.44 0 0 1 7.35-2.42Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg fill="none" viewBox="0 0 20 21">
      <path
        clipRule="evenodd"
        d="M6.281 16.145h8.094v-1.25h-8.75v1.25h.656Zm8.094-7.5V5.522h-8.75v3.125h1.25V6.77h6.25v1.875h1.25Zm-8.75 0s-1.875 0-1.875 1.563v3.125s0 1.563 1.875 1.563h1.25V11.77h6.25l.009 3.126h1.241s1.875 0 1.875-1.563v-3.125s0-1.562-1.875-1.562h-8.75Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function CommentArrowIcon() {
  return (
    <svg fill="none" viewBox="0 0 16 17">
      <path d="M2.895 4.167h5v9" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="m3.652 8.924 4.243 4.242 4.242-4.242"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function ItemControls({
  canMoveDown,
  canMoveUp,
  deleteLabel,
  moveDownLabel,
  moveUpLabel,
  onDelete,
  onMoveDown,
  onMoveUp
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  deleteLabel: string;
  moveDownLabel: string;
  moveUpLabel: string;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
}) {
  return (
    <div className="item-controls">
      <button
        aria-label={moveUpLabel}
        className="mini-action"
        disabled={!canMoveUp}
        onClick={onMoveUp}
        type="button"
      >
        ↑
      </button>
      <button
        aria-label={moveDownLabel}
        className="mini-action"
        disabled={!canMoveDown}
        onClick={onMoveDown}
        type="button"
      >
        ↓
      </button>
      <button
        aria-label={deleteLabel}
        className="mini-action mini-action--destructive"
        onClick={onDelete}
        type="button"
      >
        Delete
      </button>
    </div>
  );
}

export function RecipePage({
  canShare,
  disclaimerText,
  editUrl,
  hasAcknowledgedDisclaimer,
  loadError,
  mode,
  onAcknowledgeDisclaimer,
  onAddIngredient,
  onAddStep,
  onClearLoadError,
  onCopyShareUrl,
  onRemoveIngredient,
  onRemoveStep,
  onReorderIngredient,
  onReorderStep,
  onUpdateField,
  onUpdateIngredient,
  onUpdateStep,
  recipe,
  shareState,
  shareUrl
}: RecipePageProps) {
  const [isBlurbExpanded, setIsBlurbExpanded] = useState(mode !== 'share');

  useEffect(() => {
    setIsBlurbExpanded(mode !== 'share');
  }, [mode, recipe.blurb]);

  const shouldShowReadMore = mode === 'share' && recipe.blurb.trim() && !isBlurbExpanded;

  if (mode === 'edit' && !hasAcknowledgedDisclaimer) {
    return (
      <div className={`app-shell app-shell--locked mode-${mode}`}>
        <section
          aria-labelledby="disclaimer-title"
          aria-modal="true"
          className="disclaimer-gate"
          role="dialog"
        >
          <h1 className="disclaimer-gate__title" id="disclaimer-title">
            Disclaimer
          </h1>
          <p className="disclaimer-gate__copy">{disclaimerText}</p>
          <button
            className="disclaimer-gate__button"
            onClick={onAcknowledgeDisclaimer}
            type="button"
          >
            OK, I understand
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={`app-shell mode-${mode}`}>
      {mode === 'edit' ? (
        <section className="parody-banner">
          {disclaimerText}
        </section>
      ) : null}

      {mode === 'edit' && loadError ? (
        <section aria-live="polite" className="load-error" role="alert">
          <span>{loadError}</span>
          <button className="mini-action" onClick={onClearLoadError} type="button">
            Clear broken hash
          </button>
        </section>
      ) : null}

      <main className="page-shell">
        {mode === 'edit' ? (
          <section className="editor-toolbar">
            <div className="share-tools">
              <div className="share-tools__actions">
                <button
                  className="toolbar-action"
                  disabled={!canShare}
                  onClick={onCopyShareUrl}
                  type="button"
                >
                  Copy share URL
                </button>
                <a
                  className={`toolbar-action toolbar-action--ghost ${
                    canShare ? '' : 'is-disabled'
                  }`}
                  href={canShare ? shareUrl : undefined}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open share preview
                </a>
              </div>
              {shareState === 'copied' ? (
                <p className="share-status">Share URL copied to clipboard.</p>
              ) : null}
              {shareState === 'error' ? (
                <p className="share-status share-status--error">
                  Copy failed. Use the read-only field above instead.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        <article className="recipe-page">
          <div className="recipe-page__grid">
            <header className="recipe-header">
              <EditableField
                className="recipe-title"
                element="h1"
                label="Recipe title"
                mode={mode}
                onCommit={(value) => onUpdateField('title', value)}
                placeholder="Add a recipe title"
                rows={2}
                value={recipe.title}
              />
              <div className="recipe-header__meta">
                <p className="recipe-byline">
                  By{' '}
                  <EditableField
                    className="recipe-byline__name"
                    element="span"
                    label="Recipe author"
                    mode={mode}
                    onCommit={(value) => onUpdateField('author', value)}
                    placeholder="Add an author"
                    value={recipe.author}
                  />
                </p>
              </div>
              <p className="recipe-published">
                Published{' '}
                <EditableField
                  className="recipe-published__date"
                  displayValue={formatDate(recipe.publishedDate)}
                  element="time"
                  emptyDisplay=""
                  label="Published date"
                  mode={mode}
                  onCommit={(value) => onUpdateField('publishedDate', value)}
                  placeholder="Select a publish date"
                  type="date"
                  value={recipe.publishedDate}
                />
              </p>
            </header>

            <section className="recipe-overview">
              <div className="overview-row">
                <span className="overview-label">Total Time</span>
                <EditableField
                  className="overview-value"
                  element="div"
                  label="Cooking time"
                  mode={mode}
                  onCommit={(value) => onUpdateField('cookingTime', value)}
                  placeholder="Add total time"
                  value={recipe.cookingTime}
                />
              </div>

              <div className="overview-label">Rating</div>
              <div className="overview-rating">
                <EditableRating
                  mode={mode}
                  onCommit={(value) => onUpdateField('starRating', value)}
                  value={recipe.starRating}
                />
                <EditableField
                  className="overview-value overview-value--count"
                  displayValue={`(${formatCount(recipe.ratingsCount)})`}
                  element="div"
                  label="Ratings count"
                  mode={mode}
                  onCommit={(value) =>
                    onUpdateField('ratingsCount', Number.parseInt(value, 10) || 0)
                  }
                  placeholder="(0)"
                  type="number"
                  value={String(recipe.ratingsCount)}
                />
              </div>

              <div className="overview-label">Comments</div>
              <div className="overview-comments">
                <EditableField
                  className="overview-comments__text"
                  displayValue={`Read ${formatCount(recipe.commentsCount)} comments`}
                  element="div"
                  label="Comments count"
                  mode={mode}
                  onCommit={(value) =>
                    onUpdateField('commentsCount', Number.parseInt(value, 10) || 0)
                  }
                  placeholder="Read 0 comments"
                  type="number"
                  value={String(recipe.commentsCount)}
                />
                <CommentArrowIcon />
              </div>
            </section>

            <section
              className={`recipe-blurb ${
                shouldShowReadMore ? '' : 'recipe-blurb--expanded'
              }`}
            >
              <div className="recipe-blurb__copy">
                <EditableField
                  className="recipe-blurb__text"
                  element="p"
                  label="Recipe blurb"
                  mode={mode}
                  multiline
                  onCommit={(value) => onUpdateField('blurb', value)}
                  placeholder="Add a short headnote"
                  rows={6}
                  value={recipe.blurb}
                />
              </div>
              {shouldShowReadMore ? (
                <div className="recipe-blurb__fade">
                  <button
                    className="recipe-blurb__button"
                    onClick={() => setIsBlurbExpanded(true)}
                    type="button"
                  >
                    Read More
                  </button>
                </div>
              ) : null}
            </section>

            <section className="recipe-actions">
              <button className="pill-button pill-button--primary" type="button">
                <SaveIcon />
                <span>Save</span>
              </button>
              <button className="pill-button" type="button">
                <GiftIcon />
                <span>Give</span>
              </button>
              <button
                aria-label="Share"
                className="circle-button"
                onClick={canShare ? onCopyShareUrl : undefined}
                type="button"
              >
                <ShareIcon />
              </button>
              <button
                aria-label="Print"
                className="circle-button"
                onClick={() => window.print()}
                type="button"
              >
                <PrintIcon />
              </button>
            </section>

            <section className="recipe-content">
              <div className="section-rule" />

              <section className="ingredients-section">
                <h2 className="section-heading">Ingredients</h2>
                <div className="yield-row">
                  <span className="yield-row__label">Yield:</span>
                  <EditableField
                    className="yield-row__value"
                    element="div"
                    label="Recipe yield"
                    mode={mode}
                    onCommit={(value) => onUpdateField('yield', value)}
                    placeholder="Add a yield"
                    value={recipe.yield}
                  />
                </div>
                <ul className="ingredient-list">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li className="ingredient-item" key={`${index}-${ingredient}`}>
                      <EditableField
                        className="ingredient-copy"
                        element="div"
                        label={`Ingredient ${index + 1}`}
                        mode={mode}
                        onCommit={(value) => onUpdateIngredient(index, value)}
                        placeholder="Add an ingredient"
                        value={ingredient}
                      />
                      {mode === 'edit' ? (
                        <ItemControls
                          canMoveDown={index < recipe.ingredients.length - 1}
                          canMoveUp={index > 0}
                          deleteLabel={`Delete ingredient ${index + 1}`}
                          moveDownLabel={`Move ingredient ${index + 1} down`}
                          moveUpLabel={`Move ingredient ${index + 1} up`}
                          onDelete={() => onRemoveIngredient(index)}
                          onMoveDown={() => onReorderIngredient(index, 1)}
                          onMoveUp={() => onReorderIngredient(index, -1)}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
                {mode === 'edit' ? (
                  <button className="list-action" onClick={onAddIngredient} type="button">
                    Add ingredient
                  </button>
                ) : null}
              </section>

              <section className="preparation-section">
                <div className="section-rule section-rule--inner" />
                <h2 className="section-heading">Preparation</h2>
                <ol className="steps-list">
                  {recipe.steps.map((step, index) => (
                    <li className="step-item" key={`${index}-${step.slice(0, 24)}`}>
                      <span className="step-number">Step {index + 1}</span>
                      <div className="step-body">
                        <EditableField
                          className="step-copy"
                          element="div"
                          label={`Step ${index + 1}`}
                          mode={mode}
                          multiline
                          onCommit={(value) => onUpdateStep(index, value)}
                          placeholder="Add a preparation step"
                          rows={4}
                          value={step}
                        />
                        {mode === 'edit' ? (
                          <ItemControls
                            canMoveDown={index < recipe.steps.length - 1}
                            canMoveUp={index > 0}
                            deleteLabel={`Delete step ${index + 1}`}
                            moveDownLabel={`Move step ${index + 1} down`}
                            moveUpLabel={`Move step ${index + 1} up`}
                            onDelete={() => onRemoveStep(index)}
                            onMoveDown={() => onReorderStep(index, 1)}
                            onMoveUp={() => onReorderStep(index, -1)}
                          />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
                {mode === 'edit' ? (
                  <button className="list-action" onClick={onAddStep} type="button">
                    Add step
                  </button>
                ) : null}
              </section>
            </section>
          </div>
        </article>
      </main>

      {mode === 'share' ? (
        <footer className="share-footer">
          <p className="share-footer__disclaimer">{disclaimerText}</p>
          <a className="share-footer__button" href={editUrl}>
            Create your own recipe
          </a>
        </footer>
      ) : null}
    </div>
  );
}
