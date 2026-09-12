/**
 * MAKTAB MANAGEMENT SYSTEM - STUDENT LIST COMPONENT
 * Real Student Data (29 Boys + 25 Girls = 54 Students).
 * Filter by Boys & Girls, Case-Insensitive Instant Search.
 */

const StudentListComponent = {
  students: [],
  currentQuery: "",
  currentGenderFilter: "all", // 'all' | 'boy' | 'girl'
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

  setGenderFilter(gender) {
    this.currentGenderFilter = gender;
    this.filterAndRender();
  },

  getAvatarStyle(name, gender) {
    if (gender === "girl") {
      const girlPalettes = [
        { bg: "#fce7f3", color: "#be185d" }, // Pink
        { bg: "#ede9fe", color: "#7c3aed" }, // Violet
        { bg: "#ffe4e6", color: "#e11d48" }, // Rose
        { bg: "#fef3c7", color: "#b45309" }  // Warm Amber
      ];
      let hash = 0;
      for (let i = 0; i < (name || "").length; i++) hash += name.charCodeAt(i);
      return girlPalettes[hash % girlPalettes.length];
    } else {
      const boyPalettes = [
        { bg: "#dcfce7", color: "#15803d" }, // Emerald
        { bg: "#e0f2fe", color: "#0284c7" }, // Sky Blue
        { bg: "#ccfbf1", color: "#0f766e" }, // Teal
        { bg: "#e2e8f0", color: "#334155" }  // Slate
      ];
      let hash = 0;
      for (let i = 0; i < (name || "").length; i++) hash += name.charCodeAt(i);
      return boyPalettes[hash % boyPalettes.length];
    }
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

    const totalCount = this.students.length;
    const boysCount = this.students.filter(s => s.gender === "boy").length;
    const girlsCount = this.students.filter(s => s.gender === "girl").length;

    const q = this.currentQuery.trim().toLowerCase();
    const filtered = this.students.filter(student => {
      // Gender filter
      if (this.currentGenderFilter !== "all" && student.gender !== this.currentGenderFilter) {
        return false;
      }
      // Search filter
      if (!q) return true;
      const name = (student.name || "").toLowerCase();
      const father = (student.father_name || "").toLowerCase();
      return name.includes(q) || father.includes(q);
    });

    // Gender Filter Bar HTML
    const filterBarHtml = `
      <div class="gender-filter-bar">
        <button class="filter-pill ${this.currentGenderFilter === 'all' ? 'active' : ''}" 
                onclick="StudentListComponent.setGenderFilter('all')">
          All (${totalCount})
        </button>
        <button class="filter-pill ${this.currentGenderFilter === 'boy' ? 'active' : ''}" 
                onclick="StudentListComponent.setGenderFilter('boy')">
          👦 Boys (${boysCount})
        </button>
        <button class="filter-pill ${this.currentGenderFilter === 'girl' ? 'active' : ''}" 
                onclick="StudentListComponent.setGenderFilter('girl')">
          👧 Girls (${girlsCount})
        </button>
      </div>
    `;

    if (filtered.length === 0) {
      listContainer.innerHTML = filterBarHtml + `
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
      const style = this.getAvatarStyle(student.name, student.gender);
      const sectionLabel = student.gender === "girl" ? "Girl" : "Boy";

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
            <span class="badge-active-pill">${sectionLabel}</span>
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
            <div class="pwa-bottom-desc">Add to Home Screen for 1-tap fast access</div>
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

    listContainer.innerHTML = filterBarHtml + cardsHtml + pwaBottomCardHtml;
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
