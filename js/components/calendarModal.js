/**
 * MAKTAB MANAGEMENT SYSTEM - MONTHLY ATTENDANCE CALENDAR COMPONENT
 * Clean, readable calendar without decorative dots.
 * Allows switching months and clicking a date to inspect historical attendance.
 */

const CalendarModalComponent = {
  currentStudentId: null,
  currentStudentName: "",
  selectedYear: 2026,
  selectedMonth: 9, // 1-indexed (September = 9)
  selectedDateStr: null,
  monthlyData: { presentCount: 0, absentCount: 0, recordsMap: {} },

  /**
   * Opens the calendar for a student
   */
  async open(studentId, studentName) {
    this.currentStudentId = studentId;
    this.currentStudentName = studentName;

    // Default to current date's month/year
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedDateStr = DateUtils.getTodayDateString();

    const modal = document.getElementById("calendar-modal");
    if (modal) {
      modal.classList.add("active");
    }

    const titleEl = document.getElementById("calendar-modal-student-name");
    if (titleEl) {
      titleEl.textContent = studentName;
    }

    await this.loadMonthDataAndRender();
  },

  close() {
    const modal = document.getElementById("calendar-modal");
    if (modal) {
      modal.classList.remove("active");
    }
  },

  async prevMonth() {
    this.selectedMonth--;
    if (this.selectedMonth < 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    }
    await this.loadMonthDataAndRender();
  },

  async nextMonth() {
    this.selectedMonth++;
    if (this.selectedMonth > 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    }
    await this.loadMonthDataAndRender();
  },

  async loadMonthDataAndRender() {
    const gridEl = document.getElementById("calendar-days-grid");
    const monthTitleEl = document.getElementById("calendar-month-title");
    if (monthTitleEl) {
      monthTitleEl.textContent = DateUtils.formatMonthYear(this.selectedYear, this.selectedMonth);
    }

    if (gridEl) {
      gridEl.innerHTML = `<div style="grid-column: span 7; text-align: center; padding: 20px;" class="state-text">Loading calendar...</div>`;
    }

    try {
      this.monthlyData = await DB.getStudentMonthlyAttendance(
        this.currentStudentId,
        this.selectedYear,
        this.selectedMonth
      );
      this.renderCalendar();
      this.renderInspectionCard(this.selectedDateStr);
    } catch (err) {
      console.error("Error loading monthly data:", err);
      if (gridEl) {
        gridEl.innerHTML = `<div style="grid-column: span 7; text-align: center; color: red;" class="state-text">Unable to load calendar.</div>`;
      }
    }
  },

  renderCalendar() {
    const gridEl = document.getElementById("calendar-days-grid");
    if (!gridEl) return;

    const daysInMonth = DateUtils.getDaysInMonth(this.selectedYear, this.selectedMonth);
    const firstDayOfWeek = DateUtils.getFirstDayOfWeek(this.selectedYear, this.selectedMonth);

    let html = "";

    // Empty cells before the 1st day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      html += `<div class="calendar-day-cell empty"></div>`;
    }

    // Days 1..N
    const monthStr = DateUtils.padZero(this.selectedMonth);

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = DateUtils.padZero(d);
      const dateStr = `${this.selectedYear}-${monthStr}-${dayStr}`;
      const status = this.monthlyData.recordsMap[dateStr]; // 'present' | 'absent' | undefined

      let statusClass = "";
      if (status === "present") statusClass = "present";
      else if (status === "absent") statusClass = "absent";

      const isSelected = dateStr === this.selectedDateStr ? "selected" : "";

      html += `
        <div class="calendar-day-cell ${statusClass} ${isSelected}" 
             onclick="CalendarModalComponent.selectDate('${dateStr}')">
          ${d}
        </div>
      `;
    }

    gridEl.innerHTML = html;
  },

  selectDate(dateStr) {
    this.selectedDateStr = dateStr;
    this.renderCalendar();
    this.renderInspectionCard(dateStr);
  },

  renderInspectionCard(dateStr) {
    const inspectionCard = document.getElementById("calendar-inspection-card");
    if (!inspectionCard) return;

    if (!dateStr) {
      inspectionCard.innerHTML = `<p class="state-text">Click a date above to view attendance.</p>`;
      return;
    }

    const formattedDate = DateUtils.formatDisplayDate(dateStr, true);
    const status = this.monthlyData.recordsMap[dateStr];

    let statusDisplay = "";
    if (status === "present") {
      statusDisplay = `<span class="status-badge-inline present">Present</span>`;
    } else if (status === "absent") {
      statusDisplay = `<span class="status-badge-inline absent">Absent</span>`;
    } else {
      statusDisplay = `<span class="status-badge-inline unmarked">Attendance not marked yet</span>`;
    }

    inspectionCard.innerHTML = `
      <div class="inspection-date">${formattedDate}</div>
      <div class="inspection-status-line">
        <span>Attendance:</span>
        ${statusDisplay}
      </div>
    `;
  }
};

window.CalendarModalComponent = CalendarModalComponent;
