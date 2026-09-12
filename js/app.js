/**
 * MAKTAB MANAGEMENT SYSTEM - MAIN APPLICATION CONTROLLER
 * Routing, View Management, Toasts & Global Event Handling.
 */

const App = {
  currentView: "students", // 'students' | 'attendance' | 'teacher' | 'student-detail'
  activeStudentId: null,
  lastBackPressTime: 0,
  lastKnownSabakCutoff: null,

  async init() {
    console.log("Initializing Maktab Management System...");

    // Initialize data layer
    DB.initLocalStore();
    SupabaseClientModule.init();

    // Initial 6 PM Sabak cleanup
    await DB.cleanupOldSabak();
    this.lastKnownSabakCutoff = DateUtils.getActiveSabakInfo().targetDate;

    // Initialize PWA Installer & Service Worker
    if (window.PWAInstaller) {
      window.PWAInstaller.init();
    }

    // Initialize sub-components
    await StudentListComponent.init();
    await AttendanceViewComponent.init();
    TeacherDashboardComponent.init();

    // Bind bottom nav and history popstate for Android/iOS PWA back button
    this.bindNavigation();
    this.bindHistoryAndBack();

    // Set initial history state
    history.replaceState({ view: "students" }, "", "#students");
    this.showView("students", false);

    // Periodic check (every 30 seconds) for midnight and 6:00 PM rollover
    setInterval(() => {
      this.checkDateRollover();
    }, 30000);
  },

  bindNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        if (view) {
          this.showView(view, true);
        }
      });
    });
  },

  /**
   * Manages hardware & swipe back navigation for PWA.
   * Prevents being kicked out of the app when hitting back inside profiles or modals!
   */
  bindHistoryAndBack() {
    window.addEventListener("popstate", (e) => {
      // 1. If any modal is active, close the modal first
      const activeModal = document.querySelector(".modal-overlay.active");
      if (activeModal) {
        activeModal.classList.remove("active");
        return;
      }
      const iosModal = document.getElementById("ios-install-modal");
      if (iosModal && iosModal.classList.contains("active")) {
        iosModal.classList.remove("active");
        return;
      }

      // 2. If inside Student Profile or Teacher Portal, navigate back to Students register
      if (this.currentView === "student-detail" || this.currentView === "teacher") {
        if (this.currentView === "teacher") {
          AuthModule.logoutTeacher();
        }
        this.showView("students", false);
        return;
      }

      // 3. If on Attendance screen, back brings to student register
      if (this.currentView === "attendance") {
        this.showView("students", false);
        return;
      }

      // 4. If already on students list, prevent immediate accidental exit on PWA
      const now = Date.now();
      if (now - this.lastBackPressTime > 2000) {
        this.lastBackPressTime = now;
        history.pushState({ view: "students" }, "", "#students");
        this.showToast("Press back again to exit", "info");
      }
    });
  },

  pushModalHistory(modalName) {
    history.pushState({ modal: modalName }, "", "#" + modalName);
  },

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.showView("students", false);
    }
  },

  showView(viewName, pushHistory = true) {
    this.currentView = viewName;

    if (pushHistory) {
      history.pushState({ view: viewName }, "", "#" + viewName);
    }

    // Toggle View Sections
    const views = {
      "students": document.getElementById("view-students"),
      "attendance": document.getElementById("view-attendance"),
      "teacher": document.getElementById("view-teacher"),
      "student-detail": document.getElementById("view-student-detail")
    };

    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.toggle("active", key === viewName);
      }
    });

    // Update Bottom Nav Active States
    const navButtons = document.querySelectorAll(".nav-item");
    navButtons.forEach(btn => {
      const targetView = btn.getAttribute("data-view");
      btn.classList.toggle("active", targetView === viewName || (viewName === "student-detail" && targetView === "students"));
    });

    // View-specific activation hooks
    if (viewName === "attendance") {
      AttendanceViewComponent.loadAttendance();
    } else if (viewName === "teacher") {
      TeacherDashboardComponent.render();
    } else if (viewName === "students") {
      const searchInput = document.getElementById("search-students-input");
      if (searchInput && searchInput.value) {
        StudentListComponent.filterAndRender();
      }
    }

    // Scroll container to top
    const mainContent = document.querySelector(".main-content");
    if (mainContent) mainContent.scrollTop = 0;
  },

  async openStudentDashboard(studentId) {
    this.activeStudentId = studentId;
    this.showView("student-detail", true);
    await StudentDashboardComponent.open(studentId);
  },

  openTeacherPortal() {
    this.showView("teacher", true);
    TeacherDashboardComponent.render();
  },

  exitTeacherMode() {
    AuthModule.logoutTeacher();
    this.showView("students", false);
    this.showToast("Teacher session ended.", "info");
  },

  async checkDateRollover() {
    const currentToday = DateUtils.getTodayDateString();
    const activeSabakInfo = DateUtils.getActiveSabakInfo();

    // 1. Day Rollover for Attendance
    if (AttendanceViewComponent.todayDateStr !== currentToday) {
      console.log("New calendar day detected:", currentToday);
      AttendanceViewComponent.loadAttendance();
      if (this.currentView === "student-detail" && this.activeStudentId) {
        StudentDashboardComponent.open(this.activeStudentId);
      }
    }

    // 2. Evening 6:00 PM (18:00) Sabak Rollover / Cleanup
    if (this.lastKnownSabakCutoff !== activeSabakInfo.targetDate) {
      console.log("6:00 PM Sabak Rollover triggered. Purging previous sabak...");
      this.lastKnownSabakCutoff = activeSabakInfo.targetDate;
      await DB.cleanupOldSabak();

      // Refresh currently active screen
      if (this.currentView === "student-detail" && this.activeStudentId) {
        StudentDashboardComponent.open(this.activeStudentId);
      } else if (this.currentView === "teacher") {
        TeacherDashboardComponent.render();
      }
    }
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2800);
  }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
