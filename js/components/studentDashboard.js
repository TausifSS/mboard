/**
 * MAKTAB MANAGEMENT SYSTEM - STUDENT DASHBOARD COMPONENT
 * Minimal profile: Name, Father Name, Mobile Number,
 * Monthly Attendance Summary (Present: X, Absent: Y),
 * View Calendar button, and Previous Day Sabak [ ✓ Yes ] [ ✕ No ].
 */

const StudentDashboardComponent = {
  currentStudent: null,
  yesterdayDateStr: null,
  sabakRecord: null,
  monthlySummary: { presentCount: 0, absentCount: 0 },

  async open(studentId) {
    const container = document.getElementById("student-dashboard-content");
    if (!container) return;

    container.innerHTML = `
      <div class="state-container">
        <div class="spinner"></div>
        <p class="state-text">Loading student details...</p>
      </div>
    `;

    try {
      this.currentStudent = await DB.getStudentById(studentId);
      if (!this.currentStudent) {
        container.innerHTML = `
          <div class="state-container">
            <p class="state-text">Student not found.</p>
            <button class="btn-secondary" style="margin-top:12px;" onclick="App.showView('students')">Back to Students</button>
          </div>
        `;
        return;
      }

      // Calculate Yesterday's date for daily Sabak logic
      this.yesterdayDateStr = DateUtils.getYesterdayDateString();

      // Load Monthly Attendance for current month
      const now = new Date();
      this.monthlySummary = await DB.getStudentMonthlyAttendance(
        studentId,
        now.getFullYear(),
        now.getMonth() + 1
      );

      // Load Yesterday's Sabak record
      this.sabakRecord = await DB.getStudentSabakForDate(studentId, this.yesterdayDateStr);

      this.render();
    } catch (err) {
      console.error("Error loading student dashboard:", err);
      container.innerHTML = `
        <div class="state-container">
          <p class="state-text">Unable to load student details.</p>
          <button class="btn-secondary" style="margin-top:12px;" onclick="App.showView('students')">Back to Students</button>
        </div>
      `;
    }
  },

  render() {
    const container = document.getElementById("student-dashboard-content");
    if (!container || !this.currentStudent) return;

    const s = this.currentStudent;
    const yesterdayDisplay = DateUtils.formatDisplayDate(this.yesterdayDateStr);
    const isTeacher = AuthModule.isTeacherAuthenticated();

    // Sabak active state
    const hasSabak = this.sabakRecord !== null;
    const isSabakYes = hasSabak && this.sabakRecord.completed === true;
    const isSabakNo = hasSabak && this.sabakRecord.completed === false;

    container.innerHTML = `
      <!-- Top Navigation -->
      <div class="dashboard-top-bar">
        <button class="back-btn" onclick="App.showView('students')" title="Back">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span style="font-weight: 600; font-size: 15px;">Student Profile</span>
      </div>

      <!-- Student Info -->
      <div class="dashboard-student-header">
        <div class="dash-name">${this.escapeHtml(s.name)}</div>
        <div class="dash-meta-row">
          <div class="dash-field">
            <span class="dash-label">Father Name</span>
            <span class="dash-value">${this.escapeHtml(s.father_name)}</span>
          </div>
          <div class="dash-field">
            <span class="dash-label">Mobile Number</span>
            <span class="dash-value">
              <a href="tel:${this.escapeHtml(s.mobile)}">${this.escapeHtml(s.mobile)}</a>
            </span>
          </div>
        </div>
      </div>

      <!-- Attendance Section -->
      <div class="dash-card">
        <div class="dash-card-title">Attendance</div>
        <div class="attendance-stats-row">
          <div class="stat-box present">
            <span class="stat-title">Present</span>
            <span class="stat-num">${this.monthlySummary.presentCount}</span>
          </div>
          <div class="stat-box absent">
            <span class="stat-title">Absent</span>
            <span class="stat-num">${this.monthlySummary.absentCount}</span>
          </div>
        </div>
        <button class="btn-primary-outline" onclick="CalendarModalComponent.open('${s.id}', '${this.escapeHtml(s.name)}')">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          View Monthly Calendar
        </button>
      </div>

      <!-- Sabak Section -->
      <div class="dash-card">
        <div class="dash-card-title">Sabak</div>
        <div class="sabak-date-label">${yesterdayDisplay} — Sabak</div>
        
        <div class="sabak-binary-group">
          <button class="sabak-btn yes ${isSabakYes ? 'active' : ''}" 
                  ${!isTeacher ? 'title="Teacher authentication required to record Sabak"' : ''}
                  onclick="StudentDashboardComponent.toggleSabak(true)">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Yes
          </button>
          <button class="sabak-btn no ${isSabakNo ? 'active' : ''}"
                  ${!isTeacher ? 'title="Teacher authentication required to record Sabak"' : ''}
                  onclick="StudentDashboardComponent.toggleSabak(false)">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            No
          </button>
        </div>

        ${!hasSabak ? '<p class="state-text" style="font-size:12px; margin-top:8px;">No Sabak record found for yesterday.</p>' : ''}
      </div>
    `;
  },

  async toggleSabak(status) {
    if (!AuthModule.isTeacherAuthenticated()) {
      App.showToast("Teacher access required to record Sabak", "error");
      App.showView("teacher");
      return;
    }

    try {
      await DB.saveSabak(this.currentStudent.id, this.yesterdayDateStr, status);
      this.sabakRecord = { completed: status };
      this.render();
      App.showToast("Sabak record saved.", "success");
    } catch (err) {
      console.error("Error saving Sabak:", err);
      App.showToast("Sabak could not be saved.", "error");
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

window.StudentDashboardComponent = StudentDashboardComponent;
