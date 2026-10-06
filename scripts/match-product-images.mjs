import fs from 'node:fs';
const manifest = JSON.parse(
  fs
    .readFileSync('docs/product-image-manifest.json', 'utf8')
    .replace(/^\uFEFF/, ''),
);
const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/\(new\)/g, '')
    .replace(/[^a-z0-9]/g, '');
const aliases = {
  'Chocolate Cake Walnut': 'Chocolate and Walnut Cake',
  'American donuts': 'American Donut',
  'Sunshine Strawberry': 'Strawberry Sunshine',
  'Sunshine Blue Lemonade': 'Blue Sunshine Lemonade',
  'Vanilla Spice Latte ☕✨': 'Spiced Vanilla Latte',
  'Pistachio Cream Blend': 'Pistachio Cream Mix',
  'Cinnamon Caramel Latte': 'Caramel Cinnamon Latte',
  'Spanish Blend': 'Spanish Mix',
  'Japanese Strawberry Matcha Cream': 'Creamy Japanese Strawberry Matcha',
  'Caramel Blend': 'Caramel Mix',
  'Peach Iced Tea': 'Iced Peach Tea',
  'Sunshine Blueberry': 'Blueberry Sunshine',
  'Sunshine Peach': 'Peach Sunshine',
  'Japanese Cream Spanish Matcha': 'Spanish Japanese Matcha Cream',
  'Japanese Iced White Chocolate Matcha':
    'Iced Japanese White Chocolate Matcha',
  V60: 'V60 Coffee',
  'Original Cookie': 'Original Cookies',
  'Sunshine  Red Bull ⚡🥤': 'Red Bull Sunshine',
  'Strawberry Vanilla Cream': 'Strawberry and Vanilla Cream',
  'Japanese Cream Matcha': 'Japanese Matcha Cream',
  'Iced Shaken White Mocha': 'Shaken Iced White Mocha',
  'Fruity Ice Chocolate': 'Iced Chocolate with Fruits',
  'Mocha Blend': 'Mocha Mix',
  'Latte Blend': 'Latte Mix',
  'Matcha Salted Caramel': 'Salted Caramel Matcha',
  'White Mocha Blend': 'White Mocha Mix',
};
const matches = [],
  missing = [];
for (const p of products) {
  const name =
    p.name === 'Blueberry' && p.sourceCategory === 'Blended'
      ? 'Blueberry Blend'
      : aliases[p.name] || p.name;
  const found = manifest.filter((x) => norm(x.name) === norm(name));
  if (found.length !== 1) {
    missing.push({ id: p.id, name: p.name });
    continue;
  }
  matches.push({
    id: p.id,
    name: p.name,
    file: found[0].file,
    previousImage: p.image,
  });
}
fs.writeFileSync(
  'docs/product-image-matches.json',
  JSON.stringify({ matches, missing }, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    {
      matched: matches.length,
      missing,
      unused: manifest
        .filter((x) => !matches.some((m) => m.file === x.file))
        .map((x) => x.name),
    },
    null,
    2,
  ),
);
