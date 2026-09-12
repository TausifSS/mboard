/**
 * MAKTAB MANAGEMENT SYSTEM - TODAY'S ATTENDANCE COMPONENT
 * Focused strictly on TODAY with rapid, large [ Present ] [ Absent ] toggles.
 * Auto-advances when the date changes.
 */

const AttendanceViewComponent = {
  todayDateStr: null,
  students: [],
  attendanceMap: {}, // { [student_id]: 'present' | 'absent' }
  isLoading: false,

  async init() {
    this.todayDateStr = DateUtils.getTodayDateString();
    await this.loadAttendance();

    // Listen for auth changes or student list updates
    window.addEventListener("maktab:auth_changed", () => {
      this.render();
    });
    window.addEventListener("maktab:students_changed", async () => {
      await this.loadAttendance();
    });
  },

  async loadAttendance() {
    // Automatically re-evaluate today's date in case the day rolled over
    this.todayDateStr = DateUtils.getTodayDateString();

    const container = document.getElementById("attendance-view-content");
    if (!container) return;

    this.isLoading = true;
    container.innerHTML = `
      <div class="state-container">
        <div class="spinner"></div>
        <p class="state-text">Loading attendance...</p>
      </div>
    `;

    try {
      const [students, attendanceMap] = await Promise.all([
        DB.getStudents(),
        DB.getAttendanceMapForDate(this.todayDateStr)
      ]);

      this.students = students;
      this.attendanceMap = attendanceMap;
      this.render();
    } catch (err) {
      console.error("Error loading today's attendance:", err);
      container.innerHTML = `
        <div class="state-container">
          <p class="state-text">Unable to load attendance.</p>
          <button class="btn-secondary" style="margin-top:12px;" onclick="AttendanceViewComponent.loadAttendance()">Retry</button>
        </div>
      `;
    } finally {
      this.isLoading = false;
    }
  },

  render() {
    const container = document.getElementById("attendance-view-content");
    if (!container) return;

    const displayDate = DateUtils.formatDisplayDate(this.todayDateStr);
    const isTeacher = AuthModule.isTeacherAuthenticated();

    if (this.students.length === 0) {
      container.innerHTML = `
        <div class="today-banner">
          <span class="today-banner-title">Today's Attendance</span>
          <span class="today-banner-date">${displayDate}</span>
        </div>
        <div class="state-container">
          <p class="state-text">No students added yet.</p>
        </div>
      `;
      return;
    }

    let itemsHtml = this.students.map(student => {
      const currentStatus = this.attendanceMap[student.id]; // 'present' | 'absent' | undefined
      const isPresent = currentStatus === "present";
      const isAbsent = currentStatus === "absent";

      return `
        <div class="attendance-item">
          <div class="att-student-meta">
            <div class="att-student-name">${this.escapeHtml(student.name)}</div>
          </div>
          <div class="att-toggle-group">
            <button class="att-btn present ${isPresent ? 'active' : ''}" 
                    title="Mark Present"
                    onclick="AttendanceViewComponent.mark('${student.id}', 'present')">
              Present
            </button>
            <button class="att-btn absent ${isAbsent ? 'active' : ''}" 
                    title="Mark Absent"
                    onclick="AttendanceViewComponent.mark('${student.id}', 'absent')">
              Absent
            </button>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <!-- Dynamic Date Banner -->
      <div class="today-banner">
        <span class="today-banner-title">Today's Attendance</span>
        <span class="today-banner-date">${displayDate}</span>
      </div>

      ${!isTeacher ? `
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px 14px; font-size:13px; color:#92400e; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;">
          <span>Viewing mode. Teacher login required to save attendance.</span>
          <button class="btn-secondary" style="height:32px; padding:0 10px; font-size:12px;" onclick="App.showView('teacher')">Sign In</button>
        </div>
      ` : ''}

      <!-- Student Attendance List -->
      <div class="attendance-list">
        ${itemsHtml}
      </div>
    `;
  },

  async mark(studentId, status) {
    if (!AuthModule.isTeacherAuthenticated()) {
      App.showToast("Teacher access required to mark attendance", "error");
      App.showView("teacher");
      return;
    }

    try {
      // Optimistic update
      this.attendanceMap[studentId] = status;
      this.render();

      await DB.markAttendance(studentId, this.todayDateStr, status);
      App.showToast("Attendance updated.", "success");
    } catch (err) {
      console.error("Error marking attendance:", err);
      App.showToast("Attendance could not be saved.", "error");
      await this.loadAttendance(); // Rollback to actual state
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

window.AttendanceViewComponent = AttendanceViewComponent;
