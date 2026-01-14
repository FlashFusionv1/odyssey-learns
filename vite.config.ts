import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Inject build timestamp for PWA version checking
  define: {
    __PWA_BUILD_TIMESTAMP__: JSON.stringify(Date.now()),
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "sounds/*.mp3"],
      manifest: {
        name: "Inner Odyssey - The Learning Adventure",
        short_name: "Inner Odyssey",
        description: "Enhance, engage and support your child's mental prowess!",
        theme_color: "#FF6B9D",
        background_color: "#FFF9E6",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        // Clean old caches on activation
        cleanupOutdatedCaches: true,
        // Skip waiting to activate new SW immediately
        skipWaiting: true,
        // Claim all clients immediately
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,mp3}"],
        // Don't cache source maps or dev files
        globIgnores: ["**/node_modules/**/*", "**/*.map"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Performance optimizations - Day 3
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core - MUST be first and together
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // UI utilities - CVA, clsx, tailwind-merge MUST stay together
          if (id.includes('class-variance-authority') || 
              id.includes('node_modules/clsx/') ||
              id.includes('tailwind-merge')) {
            return 'ui-utils';
          }
          // Radix UI - all in one chunk to avoid export issues
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-ui';
          }
          // Forms
          if (id.includes('react-hook-form') || 
              id.includes('@hookform') || 
              id.includes('node_modules/zod/')) {
            return 'form-vendor';
          }
          // Charts
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'chart-vendor';
          }
          // Supabase
          if (id.includes('@supabase/')) {
            return 'supabase';
          }
          // Query
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          // Animation
          if (id.includes('framer-motion')) {
            return 'animation';
          }
          // Let all other modules (including src/components/ui/*) stay in the main bundle
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "@tanstack/react-query",
    ],
  },
}));
