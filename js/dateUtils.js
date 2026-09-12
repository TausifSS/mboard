/**
 * MAKTAB MANAGEMENT SYSTEM - DATE UTILITIES
 * Handles timezone-consistent date generation, formatting, and day calculations.
 * Avoids UTC skew by operating on standard calendar dates (YYYY-MM-DD).
 */

const DateUtils = {
  /**
   * Returns current calendar date in YYYY-MM-DD format based on local Maktab time.
   */
  getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Returns previous day's calendar date in YYYY-MM-DD format.
   * Crucial for the daily Sabak logic (today shows yesterday's Sabak).
   */
  getYesterdayDateString(referenceDateStr = null) {
    let date;
    if (referenceDateStr) {
      const parts = referenceDateStr.split('-');
      date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      date = new Date();
    }
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Returns active Sabak configuration based on the 6:00 PM (18:00) rule:
   * - Before 6:00 PM: Focuses on Yesterday's Sabak.
   * - At / After 6:00 PM (18:00): Yesterday's Sabak disappears / expires,
   *   and the screen transitions fresh to Today's Sabak.
   */
  getActiveSabakInfo() {
    const now = new Date();
    const hour = now.getHours();
    const isAfter6PM = hour >= 18;
    const targetDate = isAfter6PM ? this.getTodayDateString() : this.getYesterdayDateString();
    const label = isAfter6PM ? "Today's Sabak (Evening)" : "Yesterday's Sabak";
    return {
      isAfter6PM,
      targetDate,
      label,
      displayDate: this.formatDisplayDate(targetDate)
    };
  },

  /**
   * Formats a YYYY-MM-DD string into a friendly, readable format.
   * e.g., "2026-09-13" -> "13 September" or "13 September 2026"
   */
  formatDisplayDate(dateStr, includeYear = false) {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthName = monthNames[monthIndex] || "";
    return includeYear ? `${day} ${monthName} ${year}` : `${day} ${monthName}`;
  },

  /**
   * Formats Year and Month (1-indexed) into "September 2026"
   */
  formatMonthYear(year, month) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[month - 1]} ${year}`;
  },

  /**
   * Returns number of days in a given month of a year.
   */
  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  },

  /**
   * Returns the starting day of week for the 1st of a given month (0 = Sunday, 1 = Monday, etc.)
   */
  getFirstDayOfWeek(year, month) {
    return new Date(year, month - 1, 1).getDay();
  },

  /**
   * Helper to format single digit day/month into 2 digits
   */
  padZero(num) {
    return String(num).padStart(2, '0');
  }
};

window.DateUtils = DateUtils;
