import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from './App';
import { DEFAULT_RECIPE } from '../lib/defaultRecipe';
import { encodeRecipeToHash } from '../lib/recipePayload';

function renderWithHash(hash = '') {
  window.history.replaceState({}, '', `${window.location.pathname}${hash}`);

  return render(<App />);
}

function renderAtUrl(search = '', hash = '') {
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}${search}${hash}`
  );

  return render(<App />);
}

async function acknowledgeDisclaimer(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /ok, i understand/i }));
}

describe('App', () => {
  beforeEach(() => {
    document.title = 'Fake NYT Cooking Recipe Generator';

    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  afterEach(() => {
    window.history.replaceState({}, '', window.location.pathname);
  });

  it('allows inline editing in edit mode', async () => {
    const user = userEvent.setup();
    renderWithHash();
    await acknowledgeDisclaimer(user);

    await user.click(screen.getByRole('button', { name: 'Recipe title' }));

    const titleInput = screen.getByRole('textbox', { name: 'Recipe title' });
    fireEvent.change(titleInput, {
      target: { value: 'Smoky Beans on Toast' }
    });
    fireEvent.blur(titleInput);

    expect(screen.getByText('Smoky Beans on Toast')).toBeInTheDocument();
    expect(document.title).toBe('Fake NYT Cooking Recipe Generator');
  });

  it('supports ingredient and step add, delete, and reorder controls in edit mode', async () => {
    const user = userEvent.setup();
    const { container } = renderWithHash();
    await acknowledgeDisclaimer(user);

    const ingredientList = container.querySelector('.ingredient-list');
    expect(ingredientList).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Move ingredient 1 down' }));

    const ingredientTexts = Array.from(
      ingredientList!.querySelectorAll('.ingredient-copy .inline-trigger')
    ).map((node) => node.textContent?.trim());

    expect(ingredientTexts[0]).toBe('6 garlic cloves, thinly sliced');

    await user.click(screen.getByRole('button', { name: 'Add ingredient' }));
    expect(
      screen.getByRole('button', { name: 'Delete ingredient 9' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete ingredient 9' }));
    expect(
      screen.queryByRole('button', { name: 'Delete ingredient 9' })
    ).not.toBeInTheDocument();

    const stepItemsBefore = container.querySelectorAll('.step-item').length;
    await user.click(screen.getByRole('button', { name: 'Add step' }));
    expect(container.querySelectorAll('.step-item')).toHaveLength(
      stepItemsBefore + 1
    );

    await user.click(screen.getByRole('button', { name: 'Move step 2 up' }));

    const stepTexts = Array.from(
      container.querySelectorAll('.step-copy .inline-trigger')
    ).map((node) => node.textContent?.trim());
    expect(stepTexts[0]).toContain(
      'Add the tomatoes, season generously, and cook until they burst'
    );
  });

  it('renders a clean, non-editable share mode from a valid hash', () => {
    const shareHash = encodeRecipeToHash(DEFAULT_RECIPE);
    renderWithHash(shareHash);

    expect(document.title).toBe(DEFAULT_RECIPE.title);
    expect(screen.queryByText(/parody project/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Copy share URL' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add ingredient' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /this page is for parody use only and is not affiliated with, endorsed by, or sponsored by the new york times or nyt cooking/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Create your own recipe' })
    ).toHaveAttribute(
      'href',
      `${window.location.origin}${window.location.pathname}?mode=edit${shareHash}`
    );
  });

  it('shows the right disclaimer or footer for each mode', async () => {
    const user = userEvent.setup();
    const initialRender = renderWithHash();
    await acknowledgeDisclaimer(user);

    expect(
      screen.getByText(
        /this page is for parody use only and is not affiliated with, endorsed by, or sponsored by the new york times or nyt cooking/i
      )
    ).toBeInTheDocument();

    initialRender.unmount();
    renderWithHash(encodeRecipeToHash(DEFAULT_RECIPE));

    expect(
      screen.getByText(
        /this page is for parody use only and is not affiliated with, endorsed by, or sponsored by the new york times or nyt cooking/i
      )
    ).toBeInTheDocument();
  });

  it('requires disclaimer acknowledgement before showing the recipe page', async () => {
    const user = userEvent.setup();
    renderWithHash();

    expect(
      screen.getByRole('heading', { name: /disclaimer/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Copy share URL' })
    ).not.toBeInTheDocument();

    await acknowledgeDisclaimer(user);

    expect(screen.getByRole('button', { name: 'Copy share URL' })).toBeInTheDocument();
  });

  it('switches mode based on the root hash and falls back to edit mode on decode failure', async () => {
    const user = userEvent.setup();
    const initialRender = renderWithHash();
    await acknowledgeDisclaimer(user);

    expect(screen.getByRole('button', { name: 'Copy share URL' })).toBeInTheDocument();

    initialRender.unmount();
    const shareRender = renderWithHash(encodeRecipeToHash(DEFAULT_RECIPE));

    expect(
      screen.queryByRole('button', { name: 'Copy share URL' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /this page is for parody use only and is not affiliated with, endorsed by, or sponsored by the new york times or nyt cooking/i
      )
    ).toBeInTheDocument();

    shareRender.unmount();
    renderWithHash('#r=broken');
    await acknowledgeDisclaimer(user);

    expect(document.title).toBe('Fake NYT Cooking Recipe Generator');
    expect(screen.getByRole('alert')).toHaveTextContent(
      /could not be loaded/i
    );
    expect(screen.getByRole('button', { name: 'Copy share URL' })).toBeInTheDocument();
  });

  it('does not require disclaimer acknowledgement in share mode', () => {
    renderWithHash(encodeRecipeToHash(DEFAULT_RECIPE));

    expect(
      screen.queryByRole('heading', { name: /disclaimer/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /this page is for parody use only and is not affiliated with, endorsed by, or sponsored by the new york times or nyt cooking/i
      )
    ).toBeInTheDocument();
  });

  it('opens a hashed recipe in edit mode when explicitly requested', async () => {
    const user = userEvent.setup();
    renderAtUrl('?mode=edit', encodeRecipeToHash(DEFAULT_RECIPE));

    expect(
      screen.getByRole('heading', { name: /disclaimer/i })
    ).toBeInTheDocument();

    await acknowledgeDisclaimer(user);

    expect(screen.getByRole('button', { name: 'Copy share URL' })).toBeInTheDocument();
    expect(document.title).toBe('Fake NYT Cooking Recipe Generator');
  });

  it('reveals the full blurb and hides the Read More button in share mode', async () => {
    const user = userEvent.setup();
    const { container } = renderWithHash(encodeRecipeToHash(DEFAULT_RECIPE));

    const blurb = container.querySelector('.recipe-blurb');
    expect(blurb).not.toBeNull();
    expect(blurb).not.toHaveClass('recipe-blurb--expanded');

    const readMoreButton = screen.getByRole('button', { name: 'Read More' });
    await user.click(readMoreButton);

    expect(blurb).toHaveClass('recipe-blurb--expanded');
    expect(
      screen.queryByRole('button', { name: 'Read More' })
    ).not.toBeInTheDocument();
  });
});
