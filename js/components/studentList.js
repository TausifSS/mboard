/**
 * MAKTAB MANAGEMENT SYSTEM - STUDENT LIST COMPONENT
 * With distinct BOYS & GIRLS Sections, Section Banners, and Badges.
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

  renderStudentCard(student) {
    const initials = this.getInitials(student.name);
    const style = this.getAvatarStyle(student.name, student.gender);
    const isGirl = student.gender === "girl";
    const sectionClass = isGirl ? "girl" : "boy";
    const sectionText = isGirl ? "👧 Girls Section" : "👦 Boys Section";

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
          <span class="section-tag ${sectionClass}">${sectionText}</span>
          <span class="card-chevron">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    `;
  },

  filterAndRender() {
    const listContainer = document.getElementById("student-list-container");
    if (!listContainer) return;

    const totalCount = this.students.length;
    const boys = this.students.filter(s => s.gender === "boy");
    const girls = this.students.filter(s => s.gender === "girl");

    const q = this.currentQuery.trim().toLowerCase();

    const matchesSearch = (s) => {
      if (!q) return true;
      const name = (s.name || "").toLowerCase();
      const father = (s.father_name || "").toLowerCase();
      return name.includes(q) || father.includes(q);
    };

    const filteredBoys = boys.filter(matchesSearch);
    const filteredGirls = girls.filter(matchesSearch);

    // Section Filter Bar HTML
    const filterBarHtml = `
      <div class="gender-filter-bar">
        <button class="filter-pill ${this.currentGenderFilter === 'all' ? 'active' : ''}" 
                onclick="StudentListComponent.setGenderFilter('all')">
          All (${totalCount})
        </button>
        <button class="filter-pill ${this.currentGenderFilter === 'boy' ? 'active' : ''}" 
                onclick="StudentListComponent.setGenderFilter('boy')">
          👦 Boys Section (${boys.length})
        </button>
        <button class="filter-pill ${this.currentGenderFilter === 'girl' ? 'active' : ''}" 
                onclick="StudentListComponent.setGenderFilter('girl')">
          👧 Girls Section (${girls.length})
        </button>
      </div>
    `;

    let contentHtml = "";

    if (this.currentGenderFilter === "boy") {
      contentHtml += `
        <div class="section-banner-lush boys">
          <span>👦 Boys Student Register</span>
          <span>${filteredBoys.length} Students</span>
        </div>
        <div class="student-list">
          ${filteredBoys.length === 0 ? `<p class="state-text" style="padding:20px 0;">No boy student found.</p>` : filteredBoys.map(s => this.renderStudentCard(s)).join("")}
        </div>
      `;
    } else if (this.currentGenderFilter === "girl") {
      contentHtml += `
        <div class="section-banner-lush girls">
          <span>👧 Girls Student Register</span>
          <span>${filteredGirls.length} Students</span>
        </div>
        <div class="student-list">
          ${filteredGirls.length === 0 ? `<p class="state-text" style="padding:20px 0;">No girl student found.</p>` : filteredGirls.map(s => this.renderStudentCard(s)).join("")}
        </div>
      `;
    } else {
      // Show BOTH sections clearly divided!
      contentHtml += `
        <!-- Boys Section -->
        <div class="section-banner-lush boys">
          <span>👦 Boys Student Register</span>
          <span>${filteredBoys.length} Students</span>
        </div>
        <div class="student-list" style="margin-bottom:18px;">
          ${filteredBoys.length === 0 ? `<p class="state-text" style="padding:10px 0;">No boy student found.</p>` : filteredBoys.map(s => this.renderStudentCard(s)).join("")}
        </div>

        <!-- Girls Section -->
        <div class="section-banner-lush girls">
          <span>👧 Girls Student Register</span>
          <span>${filteredGirls.length} Students</span>
        </div>
        <div class="student-list">
          ${filteredGirls.length === 0 ? `<p class="state-text" style="padding:10px 0;">No girl student found.</p>` : filteredGirls.map(s => this.renderStudentCard(s)).join("")}
        </div>
      `;
    }

    // Permanent PWA Download Card at Bottom
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

    listContainer.innerHTML = filterBarHtml + contentHtml + pwaBottomCardHtml;
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
