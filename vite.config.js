import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DEV_CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' data:; " +
  "connect-src 'self' ws: wss: https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com https://generativelanguage.googleapis.com; " +
  "object-src 'none'; base-uri 'self'; form-action 'self';";

function devServerCspPlugin() {
  return {
    name: "dev-server-csp",
    transformIndexHtml(html, ctx) {
      if (!ctx.server) return html;
      return html.replace(
        /(<meta\s+http-equiv="Content-Security-Policy"\s+content=")[^"]*(")/i,
        `$1${DEV_CSP}$2`
      );
    }
  };
}

export default defineConfig({
  plugins: [react(), devServerCspPlugin()],
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild"
  }
});
