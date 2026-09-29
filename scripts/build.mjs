import { createDocument } from './document.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire, builtinModules } from 'node:module';
import esbuild from 'esbuild-wasm/lib/browser.js';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
globalThis.self = globalThis;
await esbuild.initialize({
  wasmModule: await WebAssembly.compile(
    fs.readFileSync(path.join(root, 'node_modules/esbuild-wasm/esbuild.wasm')),
  ),
  worker: false,
});
const extensions = [
  '',
  '.tsx',
  '.ts',
  '.js',
  '.mjs',
  '.json',
  '/index.tsx',
  '/index.ts',
  '/index.js',
];
const plugin = {
  name: 'local-files',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.path.startsWith('node:') || builtinModules.includes(args.path))
        return { path: args.path, external: true };
      let p =
        args.kind === 'entry-point' ? path.resolve(root, args.path) : args.path;
      if (p.startsWith('@/')) p = path.join(root, 'src', p.slice(2));
      else if (!path.isAbsolute(p) && !p.startsWith('.')) {
        try {
          p = createRequire(
            args.importer || path.join(root, 'package.json'),
          ).resolve(p);
        } catch {
          return { errors: [{ text: 'Cannot resolve ' + p }] };
        }
      } else if (!path.isAbsolute(p))
        p = path.resolve(args.importer ? path.dirname(args.importer) : root, p);
      for (const ext of extensions) {
        if (fs.existsSync(p + ext) && fs.statSync(p + ext).isFile())
          return { path: p + ext, namespace: 'local' };
      }
      return { errors: [{ text: 'Missing ' + p }] };
    });
    build.onLoad({ filter: /.*/, namespace: 'local' }, (args) => {
      const ext = path.extname(args.path).slice(1);
      return {
        contents: fs.readFileSync(args.path, 'utf8'),
        loader:
          ext === 'json'
            ? 'json'
            : ext === 'tsx'
              ? 'tsx'
              : ext === 'ts'
                ? 'ts'
                : 'jsx',
        resolveDir: path.dirname(args.path),
      };
    });
  },
};
// Rebuild from source so removed products and images do not linger in output.
const outputDirectory = path.resolve(root, 'dist');
if (path.dirname(outputDirectory) !== root)
  throw new Error('Invalid output directory');
fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });
const common = {
  bundle: true,
  write: false,
  plugins: [plugin],
  define: { 'process.env.NODE_ENV': '"production"' },
  jsx: 'automatic',
  logLevel: 'warning',
  minify: true,
};
const client = await esbuild.build({
  ...common,
  entryPoints: ['src/client.tsx'],
  platform: 'browser',
  format: 'esm',
});
fs.writeFileSync('dist/app.js', client.outputFiles[0].contents);
const server = await esbuild.build({
  ...common,
  entryPoints: ['src/server.tsx'],
  platform: 'node',
  format: 'cjs',
  external: ['node:*'],
});
fs.writeFileSync('dist/render.cjs', server.outputFiles[0].contents);
const { render, pageTitles } = await import(
  pathToFileURL(path.join(root, 'dist/render.cjs')).href
);
fs.cpSync('public', 'dist', { recursive: true });
fs.writeFileSync(
  'dist/style.css',
  fs.readFileSync('src/styles/globals.css', 'utf8'),
);
const products = JSON.parse(
  fs.readFileSync('src/data/products.json', 'utf8').replace(/^\uFEFF/, ''),
);
const routes = [
  ...Object.keys(pageTitles),
  ...products.map((p) => '/product/' + p.slug),
];
for (const route of routes) {
  const product = products.find((p) => route === '/product/' + p.slug);
  const title = product ? product.name : pageTitles[route] || 'Bareeq';
  const html = createDocument(title, render(route));
  const dir = path.join('dist', route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}
fs.unlinkSync('dist/render.cjs');
fs.writeFileSync(
  'dist/404.html',
  createDocument('Page not found', render('/404')),
);
console.log('Built ' + routes.length + ' prerendered pages.');
