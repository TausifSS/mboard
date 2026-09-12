/**
 * MAKTAB MANAGEMENT SYSTEM - UNIFIED DATA ACCESS LAYER
 * Handles database operations against Supabase with an automatic fallback
 * to a local persistent store with rich realistic seed data.
 */

const DB = {
  STORAGE_KEYS: {
    STUDENTS: "maktab_db_students_v1",
    ATTENDANCE: "maktab_db_attendance_v1",
    SABAK: "maktab_db_sabak_v1"
  },

  /**
   * Initializes local fallback storage with seed data if empty
   */
  initLocalStore() {
    if (!localStorage.getItem(this.STORAGE_KEYS.STUDENTS)) {
      const initialStudents = [
        {
          id: "b3c8f121-6d73-42e1-88ef-2b36a1111111",
          name: "Abdullah Shaikh",
          father_name: "Mohammed Shaikh",
          mobile: "9820011223",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "b3c8f121-6d73-42e1-88ef-2b36a2222222",
          name: "Ibrahim Shaikh",
          father_name: "Ahmed Shaikh",
          mobile: "9820033445",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "b3c8f121-6d73-42e1-88ef-2b36a3333333",
          name: "Yusuf Shaikh",
          father_name: "Tariq Shaikh",
          mobile: "9820055667",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "b3c8f121-6d73-42e1-88ef-2b36a4444444",
          name: "Ahmed Shaikh",
          father_name: "Mohammed Ahmed",
          mobile: "9820077889",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "b3c8f121-6d73-42e1-88ef-2b36a5555555",
          name: "Ibrahim Khan",
          father_name: "Yusuf Khan",
          mobile: "9820099001",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "b3c8f121-6d73-42e1-88ef-2b36a6666666",
          name: "Hamza Patel",
          father_name: "Farooq Patel",
          mobile: "9820122334",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
    }

    if (!localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE)) {
      // Seed attendance for Abdullah Shaikh for September 2026
      const abdullahId = "b3c8f121-6d73-42e1-88ef-2b36a1111111";
      const initialAttendance = [
        { id: "att-1", student_id: abdullahId, attendance_date: "2026-09-01", status: "present" },
        { id: "att-2", student_id: abdullahId, attendance_date: "2026-09-02", status: "present" },
        { id: "att-3", student_id: abdullahId, attendance_date: "2026-09-03", status: "present" },
        { id: "att-4", student_id: abdullahId, attendance_date: "2026-09-04", status: "absent" },
        { id: "att-5", student_id: abdullahId, attendance_date: "2026-09-05", status: "present" },
        { id: "att-6", student_id: abdullahId, attendance_date: "2026-09-07", status: "present" },
        { id: "att-7", student_id: abdullahId, attendance_date: "2026-09-08", status: "present" },
        { id: "att-8", student_id: abdullahId, attendance_date: "2026-09-09", status: "present" },
        { id: "att-9", student_id: abdullahId, attendance_date: "2026-09-10", status: "present" },
        { id: "att-10", student_id: abdullahId, attendance_date: "2026-09-11", status: "absent" },
        { id: "att-11", student_id: abdullahId, attendance_date: "2026-09-12", status: "present" }
      ];
      localStorage.setItem(this.STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialAttendance));
    }

    if (!localStorage.getItem(this.STORAGE_KEYS.SABAK)) {
      const abdullahId = "b3c8f121-6d73-42e1-88ef-2b36a1111111";
      const initialSabak = [
        { id: "sbk-1", student_id: abdullahId, sabak_date: "2026-09-10", completed: true },
        { id: "sbk-2", student_id: abdullahId, sabak_date: "2026-09-11", completed: false },
        { id: "sbk-3", student_id: abdullahId, sabak_date: "2026-09-12", completed: true }
      ];
      localStorage.setItem(this.STORAGE_KEYS.SABAK, JSON.stringify(initialSabak));
    }
  },

  // --------------------------------------------------------------------------
  // STUDENTS API
  // --------------------------------------------------------------------------

  /**
   * Fetches all students, optionally filtered by a search query (case-insensitive)
   */
  async getStudents(searchQuery = "") {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      let query = supabase.from("students").select("id, name, father_name, mobile").order("name");
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim();
        query = query.or(`name.ilike.%${q}%,father_name.ilike.%${q}%`);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error fetching students from Supabase:", error);
        throw new Error("Unable to load students. Please try again.");
      }
      return data || [];
    }

    // Local Store Fallback
    this.initLocalStore();
    try {
      const students = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS) || "[]");
      if (!searchQuery || !searchQuery.trim()) {
        return students.sort((a, b) => a.name.localeCompare(b.name));
      }
      const q = searchQuery.trim().toLowerCase();
      return students.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.father_name && s.father_name.toLowerCase().includes(q))
      ).sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      console.error("Local storage error:", e);
      return [];
    }
  },

  /**
   * Fetches an individual student by ID
   */
  async getStudentById(studentId) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, father_name, mobile")
        .eq("id", studentId)
        .single();
      if (error) {
        console.error("Error fetching student:", error);
        throw new Error("Unable to load student details.");
      }
      return data;
    }

    // Local Store Fallback
    this.initLocalStore();
    const students = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS) || "[]");
    return students.find(s => s.id === studentId) || null;
  },

  /**
   * Creates a new student (Protected Teacher Action)
   */
  async createStudent({ name, father_name, mobile }) {
    if (!name || !name.trim()) throw new Error("Student name is required.");
    if (!father_name || !father_name.trim()) throw new Error("Father name is required.");
    if (!mobile || !mobile.trim()) throw new Error("Mobile number is required.");

    const payload = {
      name: name.trim(),
      father_name: father_name.trim(),
      mobile: mobile.trim()
    };

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { data, error } = await supabase.from("students").insert([payload]).select().single();
      if (error) {
        console.error("Error creating student:", error);
        throw new Error("Failed to add student. Ensure teacher authorization.");
      }
      return data;
    }

    // Local Store Fallback
    this.initLocalStore();
    const students = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS) || "[]");
    const newStudent = {
      id: "std-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    students.push(newStudent);
    localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return newStudent;
  },

  /**
   * Updates an existing student (Protected Teacher Action)
   */
  async updateStudent(studentId, { name, father_name, mobile }) {
    if (!name || !name.trim()) throw new Error("Student name is required.");
    if (!father_name || !father_name.trim()) throw new Error("Father name is required.");
    if (!mobile || !mobile.trim()) throw new Error("Mobile number is required.");

    const payload = {
      name: name.trim(),
      father_name: father_name.trim(),
      mobile: mobile.trim()
    };

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("students")
        .update(payload)
        .eq("id", studentId)
        .select()
        .single();
      if (error) {
        console.error("Error updating student:", error);
        throw new Error("Failed to update student.");
      }
      return data;
    }

    // Local Store Fallback
    this.initLocalStore();
    const students = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS) || "[]");
    const index = students.findIndex(s => s.id === studentId);
    if (index === -1) throw new Error("Student not found.");

    students[index] = {
      ...students[index],
      ...payload,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return students[index];
  },

  /**
   * Deletes a student and cleans up related attendance and sabak records
   */
  async deleteStudent(studentId) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { error } = await supabase.from("students").delete().eq("id", studentId);
      if (error) {
        console.error("Error deleting student:", error);
        throw new Error("Failed to delete student.");
      }
      return true;
    }

    // Local Store Fallback
    this.initLocalStore();
    let students = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS) || "[]");
    students = students.filter(s => s.id !== studentId);
    localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    // Cascade delete attendance and sabak locally
    let attendance = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE) || "[]");
    attendance = attendance.filter(a => a.student_id !== studentId);
    localStorage.setItem(this.STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));

    let sabak = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SABAK) || "[]");
    sabak = sabak.filter(s => s.student_id !== studentId);
    localStorage.setItem(this.STORAGE_KEYS.SABAK, JSON.stringify(sabak));

    return true;
  },

  // --------------------------------------------------------------------------
  // ATTENDANCE API
  // --------------------------------------------------------------------------

  /**
   * Gets attendance records for all students on a specific date (YYYY-MM-DD)
   * Returns a dictionary: { [student_id]: 'present' | 'absent' }
   */
  async getAttendanceMapForDate(dateStr) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("attendance")
        .select("student_id, status")
        .eq("attendance_date", dateStr);
      if (error) {
        console.error("Error loading date attendance:", error);
        return {};
      }
      const map = {};
      (data || []).forEach(row => { map[row.student_id] = row.status; });
      return map;
    }

    // Local Store Fallback
    this.initLocalStore();
    const attendance = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE) || "[]");
    const map = {};
    attendance
      .filter(a => a.attendance_date === dateStr)
      .forEach(row => { map[row.student_id] = row.status; });
    return map;
  },

  /**
   * Marks or updates attendance for a student on a specific date
   * Status must be 'present' or 'absent'
   */
  async markAttendance(studentId, dateStr, status) {
    if (!["present", "absent"].includes(status)) {
      throw new Error("Invalid status. Must be 'present' or 'absent'.");
    }

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("attendance")
        .upsert(
          {
            student_id: studentId,
            attendance_date: dateStr,
            status: status
          },
          { onConflict: "student_id,attendance_date" }
        )
        .select()
        .single();

      if (error) {
        console.error("Error upserting attendance:", error);
        throw new Error("Attendance could not be saved.");
      }
      return data;
    }

    // Local Store Fallback
    this.initLocalStore();
    const attendance = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE) || "[]");
    const index = attendance.findIndex(a => a.student_id === studentId && a.attendance_date === dateStr);

    if (index !== -1) {
      attendance[index].status = status;
      attendance[index].updated_at = new Date().toISOString();
    } else {
      attendance.push({
        id: "att-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        student_id: studentId,
        attendance_date: dateStr,
        status: status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    localStorage.setItem(this.STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    return { student_id: studentId, attendance_date: dateStr, status };
  },

  /**
   * Gets monthly attendance for a specific student, year, and month (1-indexed)
   * Returns: { presentCount, absentCount, recordsMap: { [dateStr]: 'present' | 'absent' } }
   */
  async getStudentMonthlyAttendance(studentId, year, month) {
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const daysInMonth = DateUtils.getDaysInMonth(year, month);
    const endDate = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("attendance")
        .select("attendance_date, status")
        .eq("student_id", studentId)
        .gte("attendance_date", startDate)
        .lte("attendance_date", endDate);

      if (error) {
        console.error("Error fetching monthly attendance:", error);
        return { presentCount: 0, absentCount: 0, recordsMap: {} };
      }

      let presentCount = 0;
      let absentCount = 0;
      const recordsMap = {};
      (data || []).forEach(row => {
        recordsMap[row.attendance_date] = row.status;
        if (row.status === "present") presentCount++;
        else if (row.status === "absent") absentCount++;
      });
      return { presentCount, absentCount, recordsMap };
    }

    // Local Store Fallback
    this.initLocalStore();
    const attendance = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE) || "[]");
    let presentCount = 0;
    let absentCount = 0;
    const recordsMap = {};

    attendance.forEach(row => {
      if (row.student_id === studentId && row.attendance_date >= startDate && row.attendance_date <= endDate) {
        recordsMap[row.attendance_date] = row.status;
        if (row.status === "present") presentCount++;
        else if (row.status === "absent") absentCount++;
      }
    });

    return { presentCount, absentCount, recordsMap };
  },

  // --------------------------------------------------------------------------
  // SABAK API
  // --------------------------------------------------------------------------

  /**
   * Fetches a student's Sabak status for a given date
   * Returns: { completed: boolean } | null
   */
  async getStudentSabakForDate(studentId, dateStr) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("sabak")
        .select("completed")
        .eq("student_id", studentId)
        .eq("sabak_date", dateStr)
        .maybeSingle();

      if (error) {
        console.error("Error fetching sabak:", error);
        return null;
      }
      return data ? { completed: data.completed } : null;
    }

    // Local Store Fallback
    this.initLocalStore();
    const sabakList = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SABAK) || "[]");
    const record = sabakList.find(s => s.student_id === studentId && s.sabak_date === dateStr);
    return record ? { completed: record.completed } : null;
  },

  /**
   * Gets Sabak map for all students on a given date (for teacher bulk/daily view)
   * Returns: { [student_id]: boolean }
   */
  async getSabakMapForDate(dateStr) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("sabak")
        .select("student_id, completed")
        .eq("sabak_date", dateStr);
      if (error) {
        console.error("Error fetching sabak map:", error);
        return {};
      }
      const map = {};
      (data || []).forEach(r => { map[r.student_id] = r.completed; });
      return map;
    }

    // Local Store Fallback
    this.initLocalStore();
    const sabakList = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SABAK) || "[]");
    const map = {};
    sabakList
      .filter(s => s.sabak_date === dateStr)
      .forEach(r => { map[r.student_id] = r.completed; });
    return map;
  },

  /**
   * Saves or updates a student's Sabak status for a given date (true / false)
   */
  async saveSabak(studentId, dateStr, completed) {
    if (typeof completed !== "boolean") {
      throw new Error("Sabak status must be boolean (true/false).");
    }

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("sabak")
        .upsert(
          {
            student_id: studentId,
            sabak_date: dateStr,
            completed: completed
          },
          { onConflict: "student_id,sabak_date" }
        )
        .select()
        .single();

      if (error) {
        console.error("Error saving Sabak:", error);
        throw new Error("Sabak could not be saved.");
      }
      return data;
    }

    // Local Store Fallback
    this.initLocalStore();
    const sabakList = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SABAK) || "[]");
    const index = sabakList.findIndex(s => s.student_id === studentId && s.sabak_date === dateStr);

    if (index !== -1) {
      sabakList[index].completed = completed;
      sabakList[index].updated_at = new Date().toISOString();
    } else {
      sabakList.push({
        id: "sbk-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        student_id: studentId,
        sabak_date: dateStr,
        completed: completed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    localStorage.setItem(this.STORAGE_KEYS.SABAK, JSON.stringify(sabakList));
    return { student_id: studentId, sabak_date: dateStr, completed };
  }
};

window.DB = DB;
