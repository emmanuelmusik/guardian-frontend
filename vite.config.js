import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A unique ID stamped into every build — baked into the JS bundle AND
// written to version.json. If the two ever disagree at runtime, the
// running copy of the app is stale and refreshes itself.
const buildId = String(Date.now());

function emitVersionFile() {
  return {
    name: 'emit-version-file',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ buildId }),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), emitVersionFile()],
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
});
