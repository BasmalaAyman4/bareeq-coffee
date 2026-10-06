import { createDocument } from './document.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire, builtinModules } from 'node:module';
import esbuild from 'esbuild-wasm/lib/browser.js';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const assetVersion =
  process.env.GITHUB_SHA?.slice(0, 12) || Date.now().toString(36);
const versionAssets = (html) =>
  html
    .replaceAll('/app.js"', `/app.js?v=${assetVersion}"`)
    .replaceAll('/style.css"', `/style.css?v=${assetVersion}"`)
    .replaceAll('/tailwind.css"', `/tailwind.css?v=${assetVersion}"`);
try {
  process.loadEnvFile('.env.local');
} catch {}
const publicConfig = {
  url:
    process.env.PUBLIC_SUPABASE_URL ||
    'https://vdoxjbftaegdjvjpspql.supabase.co',
  key:
    process.env.PUBLIC_SUPABASE_KEY ||
    'sb_publishable_gclaFmqO5H4XwackSK6SNw_FgdUq-zK',
  vapid: process.env.PUBLIC_VAPID_KEY || '',
};
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
  define: {
    'process.env.NODE_ENV': '"production"',
    __PUBLIC_CONFIG__: JSON.stringify(publicConfig),
  },
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
execFileSync(
  process.execPath,
  [
    path.join(root, 'node_modules', 'tailwindcss', 'lib', 'cli.js'),
    '-i',
    path.join(root, 'src', 'styles', 'tailwind.css'),
    '-o',
    path.join(root, 'dist', 'tailwind.css'),
    '--minify',
  ],
  { cwd: root, stdio: 'inherit' },
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
  fs.writeFileSync(path.join(dir, 'index.html'), versionAssets(html));
}
// The rendering module can already be absent if the build was interrupted
// after prerendering. Its absence is harmless because it is never deployed.
fs.rmSync('dist/render.cjs', { force: true });
fs.writeFileSync(
  'dist/404.html',
  versionAssets(createDocument('Page not found', render('/404'))),
);
// GitHub Pages can serve the custom 404 document for a deep staff URL before
// looking up a nested index file. Keep a deterministic fallback for those
// three protected entrypoints.
const staffFallback = `<script>(function(){var p=location.pathname.replace(/\\/$/,'');var m={'/bareeq-coffee/dashboard':'/bareeq-coffee/dashboard/index.html','/bareeq-coffee/dashboard/index.html':'/bareeq-coffee/dashboard/index.html','/bareeq-coffee/founder':'/bareeq-coffee/founder/index.html','/bareeq-coffee/founder/index.html':'/bareeq-coffee/founder/index.html','/bareeq-coffee/cashier':'/bareeq-coffee/cashier/index.html','/bareeq-coffee/cashier/index.html':'/bareeq-coffee/cashier/index.html'};if(m[p]&&p!==m[p])location.replace(m[p]);})();</script>`;
fs.writeFileSync(
  'dist/404.html',
  fs
    .readFileSync('dist/404.html', 'utf8')
    .replace('</head>', staffFallback + '</head>'),
);
// GitHub Pages project sites are served below /bareeq-coffee. Rewrite
// document and manifest asset URLs for that deployment target.
if (process.env.DEPLOY_TARGET === 'github-pages') {
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(html|js|css|webmanifest)$/.test(entry.name)) {
        const source = fs.readFileSync(file, 'utf8');
        fs.writeFileSync(
          file,
          source
            .replaceAll('href="/', 'href="/bareeq-coffee/')
            .replaceAll('src="/', 'src="/bareeq-coffee/')
            .replaceAll('url(/assets/', 'url(/bareeq-coffee/assets/')
            .replaceAll("'/assets/", "'/bareeq-coffee/assets/")
            .replaceAll('"/assets/', '"/bareeq-coffee/assets/')
            .replace(/(?<!bareeq-coffee)\/assets\//g, '/bareeq-coffee/assets/')
            .replaceAll('"/founder', '"/bareeq-coffee/founder')
            .replaceAll('"/dashboard', '"/bareeq-coffee/dashboard')
            .replaceAll('"scope":"/"', '"scope":"/bareeq-coffee/"'),
        );
      }
    }
  };
  walk('dist');
}
console.log('Built ' + routes.length + ' prerendered pages.');
