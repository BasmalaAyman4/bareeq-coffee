export const money = (minor: number) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(
    minor / 100,
  );
