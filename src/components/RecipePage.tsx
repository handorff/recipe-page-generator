import { EditableField } from './EditableField';
import { EditableRating } from './EditableRating';

import type { AppMode, RecipeDraft } from '../types';

interface RecipePageProps {
  canShare: boolean;
  disclaimerText: string;
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

function HeaderLogo() {
  return (
    <svg
      aria-label="Cooking"
      className="cooking-logo"
      fill="none"
      viewBox="0 0 168 31"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26.308 1.455h-.6v22.77h.6V1.455ZM52.864 22.832v-6.257c-.667.393-1.233.72-1.733.98-.431.232-.876.44-1.333.619a8 8 0 0 1-1.153.353 6.124 6.124 0 0 1-3.778-.54 5.605 5.605 0 0 1-2.086-1.772 7.258 7.258 0 0 1-.96-1.946 7.692 7.692 0 0 1-.346-2.426 8.611 8.611 0 0 1 .28-2.265 5.997 5.997 0 0 1 .766-1.773 3.605 3.605 0 0 1 1.173-1.16 2.912 2.912 0 0 1 1.533-.406c1.733 0 2.73 1.315 2.992 3.945h4.665V1.388h-4.665v.786a10.47 10.47 0 0 0-2.392-.933c-.84-.188-1.699-.28-2.56-.273a11.582 11.582 0 0 0-3.944.666 9.849 9.849 0 0 0-3.332 2 9.009 9.009 0 0 0-2.372 3.565 14.047 14.047 0 0 0-.8 4.918c-.026 1.756.28 3.5.9 5.144a11.477 11.477 0 0 0 2.505 3.932 11.016 11.016 0 0 0 3.879 2.538c1.595.616 3.294.921 5.004.9a20.2 20.2 0 0 0 2.072-.1 15.128 15.128 0 0 0 1.853-.306c.62-.148 1.229-.332 1.826-.553a23.63 23.63 0 0 0 1.999-.867l.007.027Zm19.578-9.723a7.562 7.562 0 0 0-1.92-2.578 9.122 9.122 0 0 0-2.978-1.68 11.728 11.728 0 0 0-3.832-.6 11.015 11.015 0 0 0-3.745.62 9.327 9.327 0 0 0-2.998 1.713 7.81 7.81 0 0 0-2 2.592 7.498 7.498 0 0 0-.713 3.259 7.411 7.411 0 0 0 .713 3.238 7.756 7.756 0 0 0 2 2.56 9.533 9.533 0 0 0 3.005 1.705c1.214.424 2.492.633 3.778.62a11.61 11.61 0 0 0 3.779-.587 9.085 9.085 0 0 0 2.985-1.659 7.583 7.583 0 0 0 1.939-2.559 7.748 7.748 0 0 0 .666-3.272 8.089 8.089 0 0 0-.666-3.332l-.013-.04Zm-6.904 5.551c-.16.413-.424.778-.766 1.06a1.64 1.64 0 0 1-1.06.406 1.68 1.68 0 0 1-1.546-1.04 6.698 6.698 0 0 1-.54-2.998 5.499 5.499 0 0 1 .52-2.665 1.632 1.632 0 0 1 1.506-.893c.406-.002.799.142 1.106.406.34.293.598.67.747 1.093.21.815.298 1.658.26 2.499a6.99 6.99 0 0 1-.227 2.119v.013Zm26.788-5.537a7.563 7.563 0 0 0-1.925-2.592 9.121 9.121 0 0 0-2.98-1.68 11.728 11.728 0 0 0-3.83-.6 11.016 11.016 0 0 0-3.746.62 9.328 9.328 0 0 0-2.998 1.713 7.71 7.71 0 0 0-2 2.592 7.412 7.412 0 0 0-.72 3.259 7.331 7.331 0 0 0 .72 3.238 7.65 7.65 0 0 0 2 2.56 9.534 9.534 0 0 0 2.998 1.692 11.12 11.12 0 0 0 3.779.62c1.283.013 2.56-.185 3.778-.587a9.082 9.082 0 0 0 2.985-1.66 7.584 7.584 0 0 0 1.94-2.558 7.75 7.75 0 0 0 .666-3.272 8.089 8.089 0 0 0-.667-3.332v-.013Zm-6.91 5.537c-.166.415-.437.78-.786 1.06a1.639 1.639 0 0 1-2.606-.633 6.698 6.698 0 0 1-.54-2.999 5.499 5.499 0 0 1 .52-2.665 1.632 1.632 0 0 1 1.52-.893c.406-.005.8.14 1.106.406.342.292.602.67.753 1.093.214.828.302 1.684.26 2.539a6.99 6.99 0 0 1-.227 2.119v-.027Zm29.134 5.598V20h-1.266l-4.172-4.372 3.032-2.798h1.726V8.59h-9.456v4.239h2.313l-4.332 3.745V1.388h-8.736v4.238h1.373V20h-1.373v4.231h8.736v-6.45l5.798 6.45 6.357.027Zm9.809-22.87h-7.37v5.57h7.37v-5.57Zm1.333 22.843V20h-1.333V8.59h-8.663v4.239h1.266V20h-1.266v4.231h9.996Zm21.99 0V20h-1.333v-6.977a4.328 4.328 0 0 0-.413-1.893 4.666 4.666 0 0 0-1.159-1.512 5.498 5.498 0 0 0-1.739-.993 6.513 6.513 0 0 0-2.186-.36 7.011 7.011 0 0 0-2.999.72 6.022 6.022 0 0 0-.766.42l-1.22.812-.293.2V8.591h-8.663v4.239h1.273V20h-1.273v4.231h9.963V20h-1.273v-4.725a3.113 3.113 0 0 1 .453-1.792 1.49 1.49 0 0 1 1.333-.667 1.573 1.573 0 0 1 1.173.507 1.715 1.715 0 0 1 .486 1.253v9.655h8.636ZM168 12.83V8.59h-8.496v1.273a9.876 9.876 0 0 0-1.06-.766 5.45 5.45 0 0 0-1.013-.493 5.315 5.315 0 0 0-1.059-.253 7.716 7.716 0 0 0-1.233-.087 7.108 7.108 0 0 0-2.872.573 6.155 6.155 0 0 0-2.213 1.613 7.334 7.334 0 0 0-1.419 2.505 9.895 9.895 0 0 0-.506 3.265 9.073 9.073 0 0 0 1.139 4.592 7.387 7.387 0 0 0 2.366 2.505c.892.595 1.94.913 3.012.913a5.732 5.732 0 0 0 1.692-.26 5.882 5.882 0 0 0 1.533-.713c.24-.173.473-.36.7-.553.329-.297.64-.613.933-.946a4.523 4.523 0 0 1-1.386 3.285 4.992 4.992 0 0 1-3.519 1.18 10.492 10.492 0 0 1-4.824-1.24v4.205l.299.093c1.013.353 2.061.594 3.126.72a29.16 29.16 0 0 0 2.832.133c4.127 0 7.115-1.206 8.963-3.618a6.12 6.12 0 0 0 .879-1.44 8 8 0 0 0 .52-1.725c.116-.476.199-.96.247-1.446.048-.427.075-.857.08-1.287v-7.79H168Zm-9.076 6.123a1.39 1.39 0 0 1-1.333.847 1.717 1.717 0 0 1-1.579-.926 5.34 5.34 0 0 1-.54-2.666c0-2.479.642-3.718 1.926-3.718a1.678 1.678 0 0 1 1.333.666c.278.394.448.853.493 1.333.04.28.073.586.093.913.02.326 0 .6 0 .813a6.616 6.616 0 0 1-.406 2.705M19.525 15.635a7.996 7.996 0 0 1-4.492 4.718v-4.718l2.593-2.326-2.593-2.292V7.772a4.085 4.085 0 0 0 3.999-3.998c0-2.786-2.666-3.772-4.165-3.772a4.432 4.432 0 0 0-1.213.133v.133c.2 0 .493-.033.593-.033 1.046 0 1.833.493 1.833 1.44a1.506 1.506 0 0 1-1.633 1.439c-2.592 0-5.638-2.093-8.95-2.093C2.547.988.52 3.201.52 5.406c0 2.206 1.273 2.919 2.619 3.412v-.133a1.566 1.566 0 0 1-.72-1.44A1.946 1.946 0 0 1 4.485 5.44c2.785 0 7.27 2.333 10.055 2.333h.267v3.272l-2.592 2.265 2.592 2.326v4.785a9.71 9.71 0 0 1-3.332.553c-4.325 0-7.077-2.62-7.077-6.977-.01-1.031.134-2.057.427-3.046l2.159-.953v9.636l4.391-1.932V7.865l-6.437 2.852a7.09 7.09 0 0 1 3.605-4.065l-.033-.12C4.185 7.505 0 10.784 0 15.702c0 5.664 4.785 9.595 10.355 9.595 5.898 0 9.243-3.931 9.276-9.662h-.106Z"
        fill="#000"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d="M22 6a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h18a1 1 0 0 1 1 1Zm0 6a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1Zm-1 7a1 1 0 1 0 0-2H3a1 1 0 1 0 0 2h18Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d="m19.56 17.44-3.532-3.534A6.46 6.46 0 0 0 17 10.5a6.5 6.5 0 1 0-6.5 6.5 6.46 6.46 0 0 0 3.407-.973l3.533 3.533c.292.293.676.44 1.06.44s.768-.147 1.06-.44a1.496 1.496 0 0 0 0-2.12ZM10.5 15a4.5 4.5 0 1 1 0-9.002 4.5 4.5 0 0 1 0 9.002Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d="M6.125 4.125h11.75V19a.875.875 0 0 1-1.421.684L12 16.126l-4.454 3.558A.875.875 0 0 1 6.125 19V4.125Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path
        d="M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM18.998 16.571A1.06 1.06 0 0 0 19 16.5c0-1.38-3.686-3-7-3s-7 1.62-7 3c0 .024 0 .048.002.071H5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.429h-.002Z"
        fill="currentColor"
      />
    </svg>
  );
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
  if (!hasAcknowledgedDisclaimer) {
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
      <header className="site-chrome">
        <div className="site-chrome__inner">
          <div className="site-chrome__left">
            <button aria-label="Menu" className="chrome-icon-button" type="button">
              <MenuIcon />
            </button>
            <button aria-label="Search" className="chrome-icon-button" type="button">
              <SearchIcon />
            </button>
          </div>
          <div className="site-chrome__center">
            <HeaderLogo />
          </div>
          <div className="site-chrome__right">
            <button aria-label="Save page" className="chrome-icon-button" type="button">
              <BookmarkIcon />
            </button>
            <button aria-label="Profile" className="chrome-icon-button" type="button">
              <ProfileIcon />
            </button>
          </div>
        </div>
      </header>

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
            <div>
              <h2>Inline edit mode</h2>
              <p>
                Editing stays inside the recipe page. The utility strip remains
                outside the artboard layout so the Paper-inspired page itself can
                stay visually exact.
              </p>
            </div>
            <div className="share-tools">
              <label className="share-tools__label" htmlFor="share-url">
                Share URL
              </label>
              <input
                className="share-tools__input"
                id="share-url"
                readOnly
                value={
                  canShare
                    ? shareUrl
                    : 'Add recipe content to generate a share URL.'
                }
              />
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

            <section className="recipe-blurb">
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
              <div className="recipe-blurb__fade" aria-hidden="true">
                <span className="recipe-blurb__button">Read More</span>
              </div>
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
        <footer className="share-footer">{disclaimerText}</footer>
      ) : null}
    </div>
  );
}
