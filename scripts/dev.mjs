import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
let building = false;
let pending = false;
let server;
let debounce;

// Queue one rebuild if an edit arrives while the previous build is running.
function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  const child = spawn(process.execPath, ['scripts/build.mjs'], {
    cwd: root,
    stdio: 'inherit',
  });
  child.on('exit', (code) => {
    building = false;
    if (code === 0) {
      server ??= startServer();
      console.log('Ready. Refresh your browser to see changes.');
    } else console.error('Build failed. Fix the error above and save again.');
    if (pending) {
      pending = false;
      rebuild();
    }
  });
}

for (const directory of ['src', 'public']) {
  watch(
    new URL(`../${directory}/`, import.meta.url),
    { recursive: true },
    () => {
      clearTimeout(debounce);
      debounce = setTimeout(rebuild, 150);
    },
  );
}
rebuild();
