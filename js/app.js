/**
 * MAKTAB MANAGEMENT SYSTEM - MAIN APPLICATION CONTROLLER
 * Routing, View Management, Toasts & Global Event Handling.
 */

const App = {
  currentView: "students", // 'students' | 'attendance' | 'teacher' | 'student-detail'
  activeStudentId: null,

  async init() {
    console.log("Initializing Maktab Management System...");

    // Initialize data layer
    DB.initLocalStore();
    SupabaseClientModule.init();

    // Bind Navigation & UI buttons
    this.bindNavigation();

    // Initialize sub-components
    await StudentListComponent.init();
    await AttendanceViewComponent.init();
    TeacherDashboardComponent.init();

    // Default view
    this.showView("students");

    // Check midnight rollover periodically (every 60 seconds)
    setInterval(() => {
      this.checkDateRollover();
    }, 60000);
  },

  bindNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        if (view) {
          this.showView(view);
        }
      });
    });
  },

  showView(viewName) {
    this.currentView = viewName;

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
    this.showView("student-detail");
    await StudentDashboardComponent.open(studentId);
  },

  checkDateRollover() {
    const currentToday = DateUtils.getTodayDateString();
    if (AttendanceViewComponent.todayDateStr !== currentToday) {
      console.log("New day detected. Advancing active attendance screen to:", currentToday);
      AttendanceViewComponent.loadAttendance();
      if (this.currentView === "student-detail" && this.activeStudentId) {
        StudentDashboardComponent.open(this.activeStudentId);
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
