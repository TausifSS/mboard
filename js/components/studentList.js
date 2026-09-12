/**
 * MAKTAB MANAGEMENT SYSTEM - STUDENT LIST COMPONENT
 * Clean, fast, case-insensitive search and modern card UI with avatar initials.
 */

const StudentListComponent = {
  students: [],
  currentQuery: "",
  isLoading: false,

  async init() {
    this.bindEvents();
    await this.loadStudents();
  },

  bindEvents() {
    const searchInput = document.getElementById("search-students-input");
    const clearBtn = document.getElementById("search-clear-btn");

    if (searchInput) {
      searchInput.addEventListener("input", async (e) => {
        const val = e.target.value;
        this.currentQuery = val;
        if (clearBtn) {
          clearBtn.classList.toggle("active", Boolean(this.currentQuery));
        }

        // Secret Teacher Access Trigger via Search Bar
        const trimmed = val.trim();
        const isCodePattern = /^\d{5}-\d$/.test(trimmed);

        if (isCodePattern) {
          const res = await AuthModule.verifyTeacherAccess(trimmed);
          if (res && res.success) {
            searchInput.value = "";
            this.currentQuery = "";
            if (clearBtn) clearBtn.classList.remove("active");
            App.showToast("Teacher access granted.", "success");
            App.openTeacherPortal();
            return;
          }
        }

        this.filterAndRender();
      });

      searchInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          const trimmed = searchInput.value.trim();
          if (trimmed.length >= 6) {
            const res = await AuthModule.verifyTeacherAccess(trimmed);
            if (res && res.success) {
              searchInput.value = "";
              this.currentQuery = "";
              if (clearBtn) clearBtn.classList.remove("active");
              App.showToast("Teacher access granted.", "success");
              App.openTeacherPortal();
              return;
            }
          }
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          this.currentQuery = "";
          clearBtn.classList.remove("active");
          searchInput.focus();
          this.filterAndRender();
        }
      });
    }

    // Refresh when students change
    window.addEventListener("maktab:students_changed", async () => {
      await this.loadStudents();
    });
  },

  async loadStudents() {
    const listContainer = document.getElementById("student-list-container");
    if (!listContainer) return;

    this.isLoading = true;
    listContainer.innerHTML = `
      <div class="state-container">
        <div class="spinner"></div>
        <p class="state-text">Loading students...</p>
      </div>
    `;

    try {
      this.students = await DB.getStudents();
      this.filterAndRender();
    } catch (err) {
      listContainer.innerHTML = `
        <div class="state-container">
          <p class="state-text">Unable to load students. Please try again.</p>
          <button class="btn-secondary" style="margin-top:12px;" onclick="StudentListComponent.loadStudents()">Retry</button>
        </div>
      `;
    } finally {
      this.isLoading = false;
    }
  },

  getAvatarStyle(name) {
    const palettes = [
      { bg: "#dcfce7", color: "#15803d" }, // Emerald
      { bg: "#e0f2fe", color: "#0284c7" }, // Blue
      { bg: "#fef3c7", color: "#b45309" }, // Amber
      { bg: "#ede9fe", color: "#7c3aed" }, // Violet
      { bg: "#ffe4e6", color: "#e11d48" }, // Rose
      { bg: "#ccfbf1", color: "#0f766e" }  // Teal
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash += name.charCodeAt(i);
    return palettes[hash % palettes.length];
  },

  getInitials(name) {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  filterAndRender() {
    const listContainer = document.getElementById("student-list-container");
    if (!listContainer) return;

    const q = this.currentQuery.trim().toLowerCase();
    const filtered = this.students.filter(student => {
      if (!q) return true;
      const name = (student.name || "").toLowerCase();
      const father = (student.father_name || "").toLowerCase();
      return name.includes(q) || father.includes(q);
    });

    if (this.students.length === 0) {
      listContainer.innerHTML = `
        <div class="state-container">
          <svg class="state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="state-text">No students added yet.</p>
        </div>
      `;
      return;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="state-container">
          <svg class="state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="state-text">No student found.</p>
        </div>
      `;
      return;
    }

    const cardsHtml = filtered.map(student => {
      const initials = this.getInitials(student.name);
      const style = this.getAvatarStyle(student.name);

      return `
        <div class="student-card-lush" onclick="App.openStudentDashboard('${student.id}')">
          <div class="student-card-left">
            <div class="student-avatar" style="background-color: ${style.bg}; color: ${style.color};">
              ${initials}
            </div>
            <div class="student-info-col">
              <div class="student-name-lush">${this.escapeHtml(student.name)}</div>
              <div class="student-father-lush">Father: ${this.escapeHtml(student.father_name)}</div>
            </div>
          </div>
          <div class="student-card-right">
            <span class="badge-active-pill">Active</span>
            <span class="card-chevron">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      `;
    }).join("");

    // Permanent Small Section at the bottom of student list for PWA App Download
    const pwaBottomCardHtml = `
      <div class="pwa-bottom-card">
        <div class="pwa-bottom-left">
          <img src="assets/logo.jpg" alt="Maktab Logo" class="pwa-bottom-logo" />
          <div>
            <div class="pwa-bottom-title">Install Maktab App</div>
            <div class="pwa-bottom-desc">Add to Home Screen for 1-tap access</div>
          </div>
        </div>
        <button class="btn-pwa-install" onclick="PWAInstaller.promptInstall()">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Install
        </button>
      </div>
    `;

    listContainer.innerHTML = cardsHtml + pwaBottomCardHtml;
  },

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }
};

window.StudentListComponent = StudentListComponent;
