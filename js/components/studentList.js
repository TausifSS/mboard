/**
 * MAKTAB MANAGEMENT SYSTEM - STUDENT LIST COMPONENT
 * Clean, fast, case-insensitive search and minimal student list.
 */

const StudentListComponent = {
  students: [],
  currentQuery: "",
  isLoading: false,

  /**
   * Initializes the student list view
   */
  async init() {
    this.bindEvents();
    await this.loadStudents();
  },

  bindEvents() {
    const searchInput = document.getElementById("search-students-input");
    const clearBtn = document.getElementById("search-clear-btn");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.currentQuery = e.target.value;
        if (clearBtn) {
          clearBtn.classList.toggle("active", Boolean(this.currentQuery));
        }
        this.filterAndRender();
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

    // Refresh when students change (e.g. added/edited/deleted)
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
      const isTeacher = AuthModule.isTeacherAuthenticated();
      listContainer.innerHTML = `
        <div class="state-container">
          <svg class="state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="state-text">No students added yet.</p>
          ${isTeacher ? `<button class="btn-primary" style="margin-top:14px; width:auto; padding:0 20px;" onclick="TeacherDashboardComponent.openAddModal()">+ Add Student</button>` : ''}
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

    listContainer.innerHTML = filtered.map(student => `
      <div class="student-card" onclick="App.openStudentDashboard('${student.id}')">
        <div class="student-info">
          <div class="student-name">${this.escapeHtml(student.name)}</div>
          <div class="student-father">Father: ${this.escapeHtml(student.father_name)}</div>
        </div>
        <div class="student-card-arrow">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    `).join("");
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
