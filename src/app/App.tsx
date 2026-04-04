import { useEffect, useState } from 'react';

import { RecipePage } from '../components/RecipePage';
import { DEFAULT_RECIPE } from '../lib/defaultRecipe';
import {
  decodeRecipeFromHash,
  encodeRecipeToHash,
  hasMeaningfulContent
} from '../lib/recipePayload';
import type { AppMode, RecipeDraft } from '../types';

const PARODY_DISCLAIMER =
  'This page is for parody use only and is not affiliated with, endorsed by, or sponsored by The New York Times or NYT Cooking.';
const APP_TITLE = 'Fake NYT Cooking Recipe Generator';

interface AppState {
  draft: RecipeDraft;
  loadError: string | null;
  mode: AppMode;
}

function buildShareUrl(hash: string): string {
  if (typeof window === 'undefined') {
    return hash;
  }

  const url = new URL(window.location.href);
  url.hash = hash;

  return url.toString();
}

function initializeAppState(hash: string): AppState {
  if (!hash) {
    return {
      draft: DEFAULT_RECIPE,
      loadError: null,
      mode: 'edit'
    };
  }

  const decodedRecipe = decodeRecipeFromHash(hash);

  if (decodedRecipe.ok) {
    return {
      draft: decodedRecipe.value,
      loadError: null,
      mode: 'share'
    };
  }

  return {
    draft: DEFAULT_RECIPE,
    loadError:
      'The shared recipe URL could not be loaded. Edit mode was opened with the sample recipe instead.',
    mode: 'edit'
  };
}

function reorderList(
  values: string[],
  index: number,
  direction: -1 | 1
): string[] {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= values.length) {
    return values;
  }

  const nextValues = [...values];
  const [movedValue] = nextValues.splice(index, 1);
  nextValues.splice(targetIndex, 0, movedValue);

  return nextValues;
}

export function App() {
  const [appState, setAppState] = useState<AppState>(() =>
    initializeAppState(window.location.hash)
  );
  const [hasAcknowledgedDisclaimer, setHasAcknowledgedDisclaimer] =
    useState(false);
  const [shareState, setShareState] = useState<'copied' | 'error' | 'idle'>(
    'idle'
  );

  function updateDraft(nextDraft: RecipeDraft) {
    setAppState((currentState) => ({
      ...currentState,
      draft: nextDraft
    }));
    setShareState('idle');
  }

  function updateField<K extends keyof RecipeDraft>(
    field: K,
    value: RecipeDraft[K]
  ) {
    updateDraft({
      ...appState.draft,
      [field]: value
    });
  }

  const shareHash = encodeRecipeToHash(appState.draft);
  const shareUrl = buildShareUrl(shareHash);
  const canShare = hasMeaningfulContent(appState.draft);

  useEffect(() => {
    const recipeTitle = appState.draft.title.trim();

    document.title =
      appState.mode === 'share' && recipeTitle ? recipeTitle : APP_TITLE;
  }, [appState.draft.title, appState.mode]);

  async function copyShareUrl() {
    if (!canShare) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareState('copied');
    } catch {
      setShareState('error');
    }
  }

  return (
    <RecipePage
      canShare={canShare}
      disclaimerText={PARODY_DISCLAIMER}
      hasAcknowledgedDisclaimer={hasAcknowledgedDisclaimer}
      loadError={appState.loadError}
      mode={appState.mode}
      onAcknowledgeDisclaimer={() => setHasAcknowledgedDisclaimer(true)}
      onAddIngredient={() =>
        updateField('ingredients', [...appState.draft.ingredients, ''])
      }
      onAddStep={() => updateField('steps', [...appState.draft.steps, ''])}
      onClearLoadError={() => {
        window.history.replaceState({}, '', window.location.pathname);
        setAppState((currentState) => ({
          ...currentState,
          loadError: null
        }));
      }}
      onCopyShareUrl={copyShareUrl}
      onRemoveIngredient={(index) =>
        updateField(
          'ingredients',
          appState.draft.ingredients.filter((_, itemIndex) => itemIndex !== index)
        )
      }
      onRemoveStep={(index) =>
        updateField(
          'steps',
          appState.draft.steps.filter((_, itemIndex) => itemIndex !== index)
        )
      }
      onReorderIngredient={(index, direction) =>
        updateField(
          'ingredients',
          reorderList(appState.draft.ingredients, index, direction)
        )
      }
      onReorderStep={(index, direction) =>
        updateField('steps', reorderList(appState.draft.steps, index, direction))
      }
      onUpdateField={updateField}
      onUpdateIngredient={(index, value) =>
        updateField(
          'ingredients',
          appState.draft.ingredients.map((ingredient, itemIndex) =>
            itemIndex === index ? value : ingredient
          )
        )
      }
      onUpdateStep={(index, value) =>
        updateField(
          'steps',
          appState.draft.steps.map((step, itemIndex) =>
            itemIndex === index ? value : step
          )
        )
      }
      recipe={appState.draft}
      shareState={shareState}
      shareUrl={shareUrl}
    />
  );
}
