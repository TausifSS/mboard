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

      // Calculate Active Sabak date based on 6:00 PM rollover
      const sabakInfo = DateUtils.getActiveSabakInfo();
      this.sabakDateStr = sabakInfo.targetDate;
      this.sabakLabel = sabakInfo.label;
      this.sabakDisplayDate = sabakInfo.displayDate;
      this.isAfter6PM = sabakInfo.isAfter6PM;

      // Load Monthly Attendance for current month
      const now = new Date();
      this.monthlySummary = await DB.getStudentMonthlyAttendance(
        studentId,
        now.getFullYear(),
        now.getMonth() + 1
      );

      // Load Active Sabak record (yesterday before 6pm, today after 6pm)
      this.sabakRecord = await DB.getStudentSabakForDate(studentId, this.sabakDateStr);

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
    const isTeacher = AuthModule.isTeacherAuthenticated();

    // Sabak active state
    const hasSabak = this.sabakRecord !== null;
    const isSabakYes = hasSabak && this.sabakRecord.completed === true;
    const isSabakNo = hasSabak && this.sabakRecord.completed === false;

    container.innerHTML = `
      <!-- Top Navigation -->
      <div class="dashboard-top-bar">
        <button class="back-btn" onclick="App.goBack()" title="Back">
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

      <!-- Sabak Section (100% Read-Only for Public Interface) -->
      <div class="dash-card">
        <div class="dash-card-title">Sabak</div>
        <div class="sabak-date-label">${this.sabakLabel} · ${this.sabakDisplayDate}</div>
        
        <div class="sabak-status-read-only">
          ${hasSabak ? `
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="status-badge-inline ${isSabakYes ? 'present' : 'absent'}" style="font-size:14px; padding:6px 14px; font-weight:700;">
                ${isSabakYes ? '✓ Completed (Yes)' : '✕ Incomplete (No)'}
              </span>
            </div>
          ` : `
            <p class="state-text" style="font-size:13px; text-align:left;">
              ${this.isAfter6PM ? "Not recorded yet for today's evening session." : "No Sabak record found for yesterday."}
            </p>
          `}
        </div>
      </div>
    `;
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
