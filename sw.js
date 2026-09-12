/**
 * MAKTAB MANAGEMENT SYSTEM - SERVICE WORKER
 * Network-First strategy for application code to ensure users always receive
 * the latest deployed updates immediately, with offline cache fallback.
 */

const CACHE_NAME = "maktab-app-cache-v2.1";
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

// Install: Pre-cache assets and activate immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
      console.warn("SW pre-cache warning:", err);
    })
  );
});

// Activate: Delete all previous caches and take control of all open tabs
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Purging old service worker cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-First for same-origin resources so updates are received instantly
self.addEventListener("fetch", (event) => {
  // Pass-through external APIs (Supabase, CDN fonts, etc.)
  if (
    event.request.url.includes("supabase.co") ||
    event.request.url.includes("jsdelivr.net") ||
    event.request.url.includes("fonts.googleapis.com") ||
    event.request.url.includes("fonts.gstatic.com") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // Network-First strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
