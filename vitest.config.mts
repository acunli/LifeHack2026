import { defineConfig } from "vitest/config";
// (path import no longer needed — using import.meta.dirname)

// Vitest does not read tsconfig paths, so the "@/" alias has to be repeated here.
// Keep in sync with tsconfig.json's compilerOptions.paths.
export default defineConfig({
  resolve: {
    alias: { "@": import.meta.dirname },
  },
});
