/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './scripts/**/*.{js,mjs}'],
  theme: {
    extend: {
      colors: {
        bareeq: {
          burgundy: '#741f28',
          wine: '#4b1519',
          cream: '#f5ebdd',
          ivory: '#fff9f1',
          blush: '#e8d3cd',
          gold: '#c99152',
          espresso: '#211613',
        },
      },
      boxShadow: {
        bareeq: '0 24px 64px rgba(33, 22, 19, 0.16)',
      },
    },
  },
  // The finished storefront already owns its reset and typography. Utilities
  // are additive so the shared system can be introduced without a redesign.
  corePlugins: { preflight: false },
};
