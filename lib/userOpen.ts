/* Set when the user taps a card, so the recipe page moves focus to "Back" (as in the prototype). */
let flag = false;
export const markUserOpen = () => {
  flag = true;
};
export const takeUserOpen = () => {
  const f = flag;
  flag = false;
  return f;
};
