import stylesheet from './styles.css?raw';

describe('responsive recipe styling', () => {
  it('matches the Paper artboard structure and keeps a desktop wrapper breakpoint', () => {
    expect(stylesheet).toContain('--page-width: 390px;');
    expect(stylesheet).toContain(
      '.recipe-page__grid {\n  display: grid;\n  grid-template-columns:\n    [page-start] var(--gutter)'
    );
    expect(stylesheet).toContain(
      '.recipe-overview {\n  display: grid;\n  grid-template-columns: 104px 1fr;'
    );
    expect(stylesheet).toContain('@media (min-width: 760px)');
    expect(stylesheet).toContain('max-width: 560px;');
  });
});
