/**
 * MAKTAB MANAGEMENT SYSTEM - PWA INSTALLER MODULE
 * Handles Service Worker registration, first-time visitor install popup,
 * and permanent bottom install card.
 */

const PWAInstaller = {
  deferredPrompt: null,
  isIos: false,
  isInstalled: false,

  init() {
    // Check if running standalone (already installed)
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    this.isIos = /iphone|ipad|ipod/.test(userAgent);

    // Check version and clear old cache if version updated
    const CURRENT_VERSION = "2.1";
    if (localStorage.getItem("maktab_app_version") !== CURRENT_VERSION) {
      localStorage.setItem("maktab_app_version", CURRENT_VERSION);
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            if (name !== "maktab-app-cache-v2.1") {
              caches.delete(name);
            }
          });
        });
      }
    }

    // Register Service Worker with active update checking
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").then((reg) => {
        // Immediately check for updates from server
        reg.update().catch(() => {});

        // Listen for new worker installed
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("New Maktab version available. Refreshing to apply...");
                window.location.reload();
              }
            });
          }
        });
      }).catch(err => {
        console.warn("ServiceWorker registration failed:", err);
      });

      // Reload when controller changes
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Capture install prompt on Android/Chrome/Edge
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log("PWA install prompt captured.");

      // If not dismissed in this session and not installed, show 1st time visitor popup
      if (!this.isInstalled && !sessionStorage.getItem("maktab_pwa_dismissed")) {
        setTimeout(() => {
          this.showFirstTimePopup();
        }, 2000);
      }
    });

    // Check if app was just installed
    window.addEventListener("appinstalled", () => {
      this.isInstalled = true;
      this.hideFirstTimePopup();
      App.showToast("Maktab App installed on Home Screen!", "success");
    });

    // On iOS Safari, show prompt if first visit and not standalone
    if (this.isIos && !this.isInstalled && !sessionStorage.getItem("maktab_pwa_dismissed")) {
      setTimeout(() => {
        this.showFirstTimePopup();
      }, 2500);
    }
  },

  showFirstTimePopup() {
    const popup = document.getElementById("pwa-first-time-popup");
    if (popup && !this.isInstalled) {
      popup.classList.add("active");
    }
  },

  hideFirstTimePopup() {
    const popup = document.getElementById("pwa-first-time-popup");
    if (popup) {
      popup.classList.remove("active");
    }
    sessionStorage.setItem("maktab_pwa_dismissed", "true");
  },

  async promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log("User install choice:", outcome);
      this.deferredPrompt = null;
      this.hideFirstTimePopup();
    } else if (this.isIos) {
      this.openIosInstructionsModal();
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      App.showToast("To install: Open browser menu (⋮) and tap 'Install App' or 'Add to Home Screen'", "info");
    }
  },

  openIosInstructionsModal() {
    const modal = document.getElementById("ios-install-modal");
    if (modal) {
      modal.classList.add("active");
    }
    this.hideFirstTimePopup();
  },

  closeIosInstructionsModal() {
    const modal = document.getElementById("ios-install-modal");
    if (modal) {
      modal.classList.remove("active");
    }
  }
};

window.PWAInstaller = PWAInstaller;
