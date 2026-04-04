import type { RecipeDraft } from '../types';

export const DEFAULT_RECIPE: RecipeDraft = {
  title: 'Roasty Tomato Pasta With Crispy Garlic',
  author: 'The Imaginary Times Test Kitchen',
  publishedDate: '2026-01-12',
  cookingTime: '35 minutes',
  starRating: 5,
  ratingsCount: 512,
  commentsCount: 47,
  blurb:
    'Jammy tomatoes, crackly garlic and a glossy finish of butter make this pantry pasta taste suspiciously dinner-party ready.',
  yield: '4 servings',
  ingredients: [
    '1/4 cup olive oil',
    '6 garlic cloves, thinly sliced',
    '2 pints cherry tomatoes',
    'Kosher salt and black pepper',
    '12 ounces spaghetti',
    '2 tablespoons unsalted butter',
    '1/2 cup finely grated Parmesan',
    '1 small handful basil leaves'
  ],
  steps: [
    'Bring a large pot of salted water to a boil. In a wide skillet, warm the olive oil over medium heat and cook the garlic until pale gold at the edges.',
    'Add the tomatoes, season generously, and cook until they burst and slump into a jammy sauce, 12 to 15 minutes. Press a few with the back of a spoon to help things along.',
    'Cook the pasta until just shy of al dente. Reserve 1 cup of pasta water, then add the pasta to the skillet with the butter and a splash of the reserved water. Toss until glossy.',
    'Off the heat, stir in half the Parmesan. Add more pasta water if needed to loosen the sauce. Finish with the remaining Parmesan and the basil, then serve immediately.'
  ]
};
