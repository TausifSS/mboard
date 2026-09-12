/**
 * MAKTAB MANAGEMENT SYSTEM - SERVICE WORKER
 * Provides offline caching and satisfies PWA installability requirements.
 */

const CACHE_NAME = "maktab-app-cache-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./css/calendar.css",
  "./assets/logo.jpg",
  "./js/config.js",
  "./js/dateUtils.js",
  "./js/supabaseClient.js",
  "./js/db.js",
  "./js/auth.js",
  "./js/components/studentList.js",
  "./js/components/studentDashboard.js",
  "./js/components/attendanceView.js",
  "./js/components/calendarModal.js",
  "./js/components/teacherDashboard.js",
  "./js/components/adsService.js",
  "./js/pwaInstaller.js",
  "./js/app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Pass-through network requests for external APIs (like Supabase)
  if (event.request.url.includes("supabase.co") || event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback to cached index.html for navigation
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
