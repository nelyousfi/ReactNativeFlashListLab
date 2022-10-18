export const generateItems = (n: number): Array<number> => {
  return Array.from(Array(n)).map((_, i) => {
    return i;
  });
};
