/**
 * MAKTAB MANAGEMENT SYSTEM - TEACHER DASHBOARD COMPONENT
 * Provides secure authentication gate and streamlined student CRUD management.
 */

const TeacherDashboardComponent = {
  students: [],
  selectedStudentForEdit: null,
  selectedStudentForDelete: null,
  currentTeacherTab: "students", // 'students' | 'attendance' | 'sabak'

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Listen for auth changes
    window.addEventListener("maktab:auth_changed", () => {
      this.render();
    });
  },

  async render() {
    const container = document.getElementById("teacher-dashboard-content");
    if (!container) return;

    const isAuthenticated = AuthModule.isTeacherAuthenticated();

    if (!isAuthenticated) {
      this.renderAuthGate(container);
    } else {
      await this.renderTeacherPanel(container);
    }
  },

  renderAuthGate(container) {
    container.innerHTML = `
      <div class="teacher-auth-card">
        <div class="lock-badge">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div class="teacher-auth-title">Teacher Access</div>
        <p class="teacher-auth-desc">Enter your private access code to manage students, attendance, and Sabak.</p>
        
        <form onsubmit="TeacherDashboardComponent.handleAuthSubmit(event)">
          <input type="password" 
                 id="teacher-passcode-input" 
                 class="pin-input-box" 
                 placeholder="••••••" 
                 autocomplete="off" 
                 required />
          <button type="submit" id="teacher-login-btn" class="btn-primary">
            Authenticate
          </button>
        </form>
      </div>
    `;
  },

  async handleAuthSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("teacher-passcode-input");
    const btn = document.getElementById("teacher-login-btn");
    if (!input || !btn) return;

    const code = input.value;
    btn.disabled = true;
    btn.textContent = "Verifying...";

    const res = await AuthModule.verifyTeacherAccess(code);
    btn.disabled = false;
    btn.textContent = "Authenticate";

    if (res.success) {
      App.showToast("Teacher access granted.", "success");
      await this.render();
    } else {
      App.showToast(res.error || "Authentication failed.", "error");
      input.value = "";
      input.focus();
    }
  },

  async renderTeacherPanel(container) {
    container.innerHTML = `
      <div class="state-container">
        <div class="spinner"></div>
        <p class="state-text">Loading management console...</p>
      </div>
    `;

    try {
      this.students = await DB.getStudents();
    } catch (err) {
      console.error("Error loading students for teacher:", err);
      this.students = [];
    }

    const todayDisplay = DateUtils.formatDisplayDate(DateUtils.getTodayDateString());
    const yesterdayDisplay = DateUtils.formatDisplayDate(DateUtils.getYesterdayDateString());

    container.innerHTML = `
      <!-- Teacher Header -->
      <div class="teacher-panel-header">
        <div>
          <h2 class="section-title">Teacher Dashboard</h2>
          <span style="font-size: 12px; color: var(--text-muted);">Authenticated Session</span>
        </div>
        <button class="btn-secondary" style="height:34px; font-size:12px;" onclick="AuthModule.logoutTeacher()">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      <!-- Quick Action Bar -->
      <div class="teacher-actions-bar">
        <button class="btn-primary" style="flex:1;" onclick="TeacherDashboardComponent.openAddModal()">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </button>
      </div>

      <!-- Managed Student List -->
      <div class="section-header" style="margin-top:16px;">
        <span style="font-weight:700; font-size:15px;">All Students (${this.students.length})</span>
      </div>

      <div class="student-list" style="margin-top: 8px;">
        ${this.students.length === 0 ? `
          <div class="state-container">
            <p class="state-text">No students added yet.</p>
          </div>
        ` : this.students.map(s => `
          <div class="student-card" style="cursor:default;">
            <div class="student-info" style="flex:1;" onclick="App.openStudentDashboard('${s.id}')">
              <div class="student-name">${this.escapeHtml(s.name)}</div>
              <div class="student-father">Father: ${this.escapeHtml(s.father_name)} · ${this.escapeHtml(s.mobile)}</div>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn-secondary" style="height:32px; padding:0 8px;" title="Edit Student" onclick="TeacherDashboardComponent.openEditModal('${s.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button class="btn-danger-outline" style="height:32px; padding:0 8px;" title="Delete Student" onclick="TeacherDashboardComponent.openDeleteModal('${s.id}', '${this.escapeHtml(s.name)}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // Student Modals: Add, Edit, Delete
  // --------------------------------------------------------------------------
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
        // Edit existing
        await DB.updateStudent(id, { name, father_name, mobile });
        App.showToast("Student updated successfully.", "success");
      } else {
        // Add new
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
