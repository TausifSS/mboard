/**
 * MAKTAB MANAGEMENT SYSTEM - TEACHER DASHBOARD COMPONENT
 * Hidden teacher portal unlocked exclusively via secret code in search bar.
 * Upgraded with lush Islamic styling and initial avatars matching the reference design.
 */

const TeacherDashboardComponent = {
  students: [],
  attendanceMap: {},
  sabakMap: {},
  currentTeacherTab: "attendance", // 'attendance' | 'sabak' | 'students'
  todayDateStr: null,
  yesterdayDateStr: null,

  selectedStudentForEdit: null,
  selectedStudentForDelete: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    window.addEventListener("maktab:auth_changed", () => {
      this.render();
    });
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

  async render() {
    const container = document.getElementById("teacher-dashboard-content");
    if (!container) return;

    if (!AuthModule.isTeacherAuthenticated()) {
      container.innerHTML = `
        <div class="teacher-auth-card" style="margin-top: 30px;">
          <div class="lock-badge">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div class="teacher-auth-title">Teacher Portal Protected</div>
          <p class="teacher-auth-desc">Type your private access code into the main search bar to access the Teacher Portal.</p>
          <button class="btn-primary" style="margin-top: 14px; width: 100%;" onclick="App.showView('students')">
            Back to Student List
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="state-container">
        <div class="spinner"></div>
        <p class="state-text">Loading teacher console...</p>
      </div>
    `;

    this.todayDateStr = DateUtils.getTodayDateString();
    this.yesterdayDateStr = DateUtils.getYesterdayDateString();

    try {
      const [students, attendanceMap, sabakMap] = await Promise.all([
        DB.getStudents(),
        DB.getAttendanceMapForDate(this.todayDateStr),
        DB.getSabakMapForDate(this.yesterdayDateStr)
      ]);

      this.students = students;
      this.attendanceMap = attendanceMap;
      this.sabakMap = sabakMap;

      this.renderPortal(container);
    } catch (err) {
      console.error("Error loading teacher portal data:", err);
      container.innerHTML = `
        <div class="state-container">
          <p class="state-text">Unable to load teacher records.</p>
          <button class="btn-secondary" style="margin-top: 12px;" onclick="TeacherDashboardComponent.render()">Retry</button>
        </div>
      `;
    }
  },

  switchTab(tabName) {
    this.currentTeacherTab = tabName;
    const container = document.getElementById("teacher-dashboard-content");
    if (container) {
      this.renderPortal(container);
    }
  },

  renderPortal(container) {
    const todayDisplay = DateUtils.formatDisplayDate(this.todayDateStr);
    const yesterdayDisplay = DateUtils.formatDisplayDate(this.yesterdayDateStr);

    container.innerHTML = `
      <!-- Teacher Top Header -->
      <div class="teacher-panel-header">
        <div>
          <h2 class="section-title" style="display:flex; align-items:center; gap:8px;">
            <span>Teacher Portal</span>
            <span style="font-size:11px; padding:2px 8px; border-radius:999px; background:var(--color-primary-light); color:var(--color-primary); font-weight:700;">Active</span>
          </h2>
          <span style="font-size: 12px; color: var(--text-muted);">Manage Attendance, Sabak & Students</span>
        </div>
        <button class="btn-secondary" style="height:34px; font-size:12px;" onclick="App.exitTeacherMode()">
          Exit Portal
        </button>
      </div>

      <!-- Segmented Tabs -->
      <div style="display:flex; background:var(--bg-input); padding:4px; border-radius:var(--radius-md); margin-bottom:16px; gap:4px;">
        <button class="btn-tab ${this.currentTeacherTab === 'attendance' ? 'active' : ''}" 
                onclick="TeacherDashboardComponent.switchTab('attendance')">
          Attendance
        </button>
        <button class="btn-tab ${this.currentTeacherTab === 'sabak' ? 'active' : ''}" 
                onclick="TeacherDashboardComponent.switchTab('sabak')">
          Sabak
        </button>
        <button class="btn-tab ${this.currentTeacherTab === 'students' ? 'active' : ''}" 
                onclick="TeacherDashboardComponent.switchTab('students')">
          Students (${this.students.length})
        </button>
      </div>

      <!-- Tab Content -->
      <div id="teacher-tab-content">
        ${this.renderTabContent(todayDisplay, yesterdayDisplay)}
      </div>
    `;
  },

  renderTabContent(todayDisplay, yesterdayDisplay) {
    if (this.currentTeacherTab === "attendance") {
      return this.renderAttendanceTab(todayDisplay);
    } else if (this.currentTeacherTab === "sabak") {
      return this.renderSabakTab(yesterdayDisplay);
    } else {
      return this.renderStudentsTab();
    }
  },

  // 1. Attendance Tab
  renderAttendanceTab(todayDisplay) {
    return `
      <div class="today-banner">
        <span class="today-banner-title">Today's Attendance</span>
        <span class="today-banner-date">${todayDisplay}</span>
      </div>

      ${this.students.length === 0 ? `
        <div class="state-container">
          <p class="state-text">No students added yet.</p>
          <button class="btn-primary" style="margin-top:12px; width:auto; padding:0 18px;" onclick="TeacherDashboardComponent.openAddModal()">+ Add Student</button>
        </div>
      ` : `
        <div class="attendance-list">
          ${this.students.map(s => {
            const status = this.attendanceMap[s.id];
            const isPresent = status === "present";
            const isAbsent = status === "absent";
            const initials = this.getInitials(s.name);
            const style = this.getAvatarStyle(s.name);

            return `
              <div class="attendance-item">
                <div class="att-student-meta" style="display:flex; align-items:center; gap:10px;">
                  <div class="student-avatar" style="width:38px; height:38px; font-size:13px; border-radius:10px; background-color:${style.bg}; color:${style.color};">
                    ${initials}
                  </div>
                  <div>
                    <div class="att-student-name">${this.escapeHtml(s.name)}</div>
                    <div style="font-size:12px; color:var(--text-muted);">Father: ${this.escapeHtml(s.father_name)}</div>
                  </div>
                </div>
                <div class="att-toggle-group">
                  <button class="att-btn present ${isPresent ? 'active' : ''}" 
                          onclick="TeacherDashboardComponent.markAttendance('${s.id}', 'present')">
                    Present
                  </button>
                  <button class="att-btn absent ${isAbsent ? 'active' : ''}" 
                          onclick="TeacherDashboardComponent.markAttendance('${s.id}', 'absent')">
                    Absent
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    `;
  },

  async markAttendance(studentId, status) {
    try {
      this.attendanceMap[studentId] = status;
      this.renderPortal(document.getElementById("teacher-dashboard-content"));

      await DB.markAttendance(studentId, this.todayDateStr, status);
      App.showToast("Attendance saved.", "success");
    } catch (err) {
      console.error("Error marking attendance:", err);
      App.showToast("Attendance could not be saved.", "error");
    }
  },

  // 2. Sabak Tab
  renderSabakTab(yesterdayDisplay) {
    return `
      <div class="today-banner" style="background:#fef3c7; border-color:#fde68a;">
        <span class="today-banner-title" style="color:#92400e;">Yesterday's Sabak</span>
        <span class="today-banner-date" style="color:#b45309;">${yesterdayDisplay}</span>
      </div>

      ${this.students.length === 0 ? `
        <div class="state-container">
          <p class="state-text">No students added yet.</p>
        </div>
      ` : `
        <div class="attendance-list">
          ${this.students.map(s => {
            const completed = this.sabakMap[s.id];
            const isYes = completed === true;
            const isNo = completed === false;
            const initials = this.getInitials(s.name);
            const style = this.getAvatarStyle(s.name);

            return `
              <div class="attendance-item">
                <div class="att-student-meta" style="display:flex; align-items:center; gap:10px;">
                  <div class="student-avatar" style="width:38px; height:38px; font-size:13px; border-radius:10px; background-color:${style.bg}; color:${style.color};">
                    ${initials}
                  </div>
                  <div>
                    <div class="att-student-name">${this.escapeHtml(s.name)}</div>
                    <div style="font-size:12px; color:var(--text-muted);">Father: ${this.escapeHtml(s.father_name)}</div>
                  </div>
                </div>
                <div class="att-toggle-group">
                  <button class="att-btn present ${isYes ? 'active' : ''}" 
                          style="${isYes ? 'background:var(--color-primary); border-color:var(--color-primary); color:#ffffff;' : ''}"
                          onclick="TeacherDashboardComponent.recordSabak('${s.id}', true)">
                    ✓ Yes
                  </button>
                  <button class="att-btn absent ${isNo ? 'active' : ''}" 
                          style="${isNo ? 'background:#475569; border-color:#475569; color:#ffffff;' : ''}"
                          onclick="TeacherDashboardComponent.recordSabak('${s.id}', false)">
                    ✕ No
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    `;
  },

  async recordSabak(studentId, completed) {
    try {
      this.sabakMap[studentId] = completed;
      this.renderPortal(document.getElementById("teacher-dashboard-content"));

      await DB.saveSabak(studentId, this.yesterdayDateStr, completed);
      App.showToast("Sabak record saved.", "success");
    } catch (err) {
      console.error("Error saving Sabak:", err);
      App.showToast("Sabak could not be saved.", "error");
    }
  },

  // 3. Students Tab
  renderStudentsTab() {
    return `
      <div class="teacher-actions-bar">
        <button class="btn-primary" style="width:100%;" onclick="TeacherDashboardComponent.openAddModal()">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </button>
      </div>

      <div class="student-list" style="margin-top: 14px;">
        ${this.students.length === 0 ? `
          <div class="state-container">
            <p class="state-text">No students added yet.</p>
          </div>
        ` : this.students.map(s => {
          const initials = this.getInitials(s.name);
          const style = this.getAvatarStyle(s.name);
          return `
            <div class="student-card-lush" style="cursor:default;">
              <div class="student-card-left" onclick="App.openStudentDashboard('${s.id}')" style="cursor:pointer;">
                <div class="student-avatar" style="background-color: ${style.bg}; color: ${style.color};">
                  ${initials}
                </div>
                <div class="student-info-col">
                  <div class="student-name-lush">${this.escapeHtml(s.name)}</div>
                  <div class="student-father-lush">Father: ${this.escapeHtml(s.father_name)} · ${this.escapeHtml(s.mobile)}</div>
                </div>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn-secondary" style="height:34px; padding:0 10px;" title="Edit Student" onclick="TeacherDashboardComponent.openEditModal('${s.id}')">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="btn-danger-outline" style="height:34px; padding:0 10px;" title="Delete Student" onclick="TeacherDashboardComponent.openDeleteModal('${s.id}', '${this.escapeHtml(s.name)}')">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  // Modals
  openAddModal() {
    const modal = document.getElementById("student-form-modal");
    const titleEl = document.getElementById("student-form-title");
    const idInput = document.getElementById("student-form-id");
    const nameInput = document.getElementById("student-form-name");
    const fatherInput = document.getElementById("student-form-father");
    const mobileInput = document.getElementById("student-form-mobile");

    if (titleEl) titleEl.textContent = "Add Student";
    if (idInput) idInput.value = "";
    if (nameInput) nameInput.value = "";
    if (fatherInput) fatherInput.value = "";
    if (mobileInput) mobileInput.value = "";

    if (modal) modal.classList.add("active");
  },

  async openEditModal(studentId) {
    const student = await DB.getStudentById(studentId);
    if (!student) return;

    this.selectedStudentForEdit = student;
    const modal = document.getElementById("student-form-modal");
    const titleEl = document.getElementById("student-form-title");
    const idInput = document.getElementById("student-form-id");
    const nameInput = document.getElementById("student-form-name");
    const fatherInput = document.getElementById("student-form-father");
    const mobileInput = document.getElementById("student-form-mobile");

    if (titleEl) titleEl.textContent = "Edit Student";
    if (idInput) idInput.value = student.id;
    if (nameInput) nameInput.value = student.name;
    if (fatherInput) fatherInput.value = student.father_name;
    if (mobileInput) mobileInput.value = student.mobile;

    if (modal) modal.classList.add("active");
  },

  closeStudentModal() {
    const modal = document.getElementById("student-form-modal");
    if (modal) modal.classList.remove("active");
  },

  async handleSaveStudent(e) {
    e.preventDefault();
    const id = document.getElementById("student-form-id").value;
    const name = document.getElementById("student-form-name").value;
    const father_name = document.getElementById("student-form-father").value;
    const mobile = document.getElementById("student-form-mobile").value;

    try {
      if (id) {
        await DB.updateStudent(id, { name, father_name, mobile });
        App.showToast("Student updated successfully.", "success");
      } else {
        await DB.createStudent({ name, father_name, mobile });
        App.showToast("Student added successfully.", "success");
      }
      this.closeStudentModal();
      window.dispatchEvent(new CustomEvent("maktab:students_changed"));
      await this.render();
    } catch (err) {
      console.error("Error saving student:", err);
      App.showToast(err.message || "Failed to save student.", "error");
    }
  },

  openDeleteModal(studentId, studentName) {
    this.selectedStudentForDelete = { id: studentId, name: studentName };
    const modal = document.getElementById("delete-student-modal");
    const nameSpan = document.getElementById("delete-student-name");
    if (nameSpan) nameSpan.textContent = studentName;
    if (modal) modal.classList.add("active");
  },

  closeDeleteModal() {
    const modal = document.getElementById("delete-student-modal");
    if (modal) modal.classList.remove("active");
    this.selectedStudentForDelete = null;
  },

  async confirmDeleteStudent() {
    if (!this.selectedStudentForDelete) return;
    const studentId = this.selectedStudentForDelete.id;

    try {
      await DB.deleteStudent(studentId);
      App.showToast("Student deleted.", "success");
      this.closeDeleteModal();
      window.dispatchEvent(new CustomEvent("maktab:students_changed"));
      await this.render();
    } catch (err) {
      console.error("Error deleting student:", err);
      App.showToast(err.message || "Could not delete student.", "error");
    }
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

window.TeacherDashboardComponent = TeacherDashboardComponent;
