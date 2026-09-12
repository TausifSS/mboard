/**
 * MAKTAB MANAGEMENT SYSTEM - UNIFIED DATA ACCESS LAYER
 * Real Student Data (29 Boys + 25 Girls).
 * Zero dummy attendance / zero dummy sabak.
 */

const REAL_STUDENTS_SEED = [
  // --- 29 BOYS ---
  { id: "boy-01", name: "Irshad Tamboli", father_name: "Mubarak Tamboli", mobile: "9822353425", gender: "boy" },
  { id: "boy-02", name: "Arsalan Tamboli", father_name: "Ayuub Tamboli", mobile: "9860952493", gender: "boy" },
  { id: "boy-03", name: "Huzaif Tamboli", father_name: "Irfan Tamboli", mobile: "9673886060", gender: "boy" },
  { id: "boy-04", name: "Arsh Shaikh", father_name: "Riyaz Shaikh", mobile: "", gender: "boy" },
  { id: "boy-05", name: "Arsalan Tamboli", father_name: "Mustak Tamboli", mobile: "", gender: "boy" },
  { id: "boy-06", name: "Ab Rahman Alamel", father_name: "Nabi Rasul Alamel", mobile: "9860258779", gender: "boy" },
  { id: "boy-07", name: "Abu Talha Pathan", father_name: "Alim Pathan", mobile: "7798523804", gender: "boy" },
  { id: "boy-08", name: "Dastgir Guledgud", father_name: "Guspak Guledgud", mobile: "7057116809", gender: "boy" },
  { id: "boy-09", name: "Fahad Shah", father_name: "Usman Shah", mobile: "8459895293", gender: "boy" },
  { id: "boy-10", name: "Rohan Roshan", father_name: "Roshan Ali", mobile: "6388221952", gender: "boy" },
  { id: "boy-11", name: "Suleman Alamel", father_name: "Nabi Rasul Alamel", mobile: "9860258779", gender: "boy" },
  { id: "boy-12", name: "Muawiyah Sayyad", father_name: "Naveed Sayyad", mobile: "9595308109", gender: "boy" },
  { id: "boy-13", name: "Azhaan Shaikh", father_name: "Imtiyaz Shaikh", mobile: "9623738419", gender: "boy" },
  { id: "boy-14", name: "Saad Shaikh", father_name: "Yaseen Shaikh", mobile: "9922874685", gender: "boy" },
  { id: "boy-15", name: "Faizal Tamboli", father_name: "Jamir Tamboli", mobile: "8446140501", gender: "boy" },
  { id: "boy-16", name: "Mohammad Hanzala", father_name: "Mazhar Shah", mobile: "9604063568", gender: "boy" },
  { id: "boy-17", name: "Sultan Tamboli", father_name: "Shahbaz Tamboli", mobile: "9673886060", gender: "boy" },
  { id: "boy-18", name: "Mo Tamhid", father_name: "Mo Ismail Ali", mobile: "7458806386", gender: "boy" },
  { id: "boy-19", name: "Sahir Tamboli", father_name: "Salim Tamboli", mobile: "9579409191", gender: "boy" },
  { id: "boy-20", name: "Arsalan Tamboli", father_name: "Shoyab Tamboli", mobile: "9730202496", gender: "boy" },
  { id: "boy-21", name: "Mubarak Ansari", father_name: "Asgar Ansari", mobile: "", gender: "boy" },
  { id: "boy-22", name: "Aahil Shaikh", father_name: "Javeed Shaikh", mobile: "", gender: "boy" },
  { id: "boy-23", name: "Muhammad Khan", father_name: "Irshad Khan", mobile: "9175363517", gender: "boy" },
  { id: "boy-24", name: "Bilal Sayyad", father_name: "Sajid Sayyad", mobile: "", gender: "boy" },
  { id: "boy-25", name: "Miraj Hawaldar", father_name: "Shakir Hawaldar", mobile: "9970234289", gender: "boy" },
  { id: "boy-26", name: "Sahil Guledgud", father_name: "Guspak Guledgud", mobile: "7057116809", gender: "boy" },
  { id: "boy-27", name: "Armaan Attar", father_name: "Abdul Attar", mobile: "9881056095", gender: "boy" },
  { id: "boy-28", name: "Anas Ansari", father_name: "Shakir Ansari", mobile: "", gender: "boy" },
  { id: "boy-29", name: "Faiz Ansari", father_name: "Shakir Ansari", mobile: "", gender: "boy" },

  // --- 25 GIRLS ---
  { id: "girl-01", name: "Sana Tamboli", father_name: "Firoz Tamboli", mobile: "8975158138", gender: "girl" },
  { id: "girl-02", name: "Aliya Tamboli", father_name: "Abdul Attar", mobile: "9881056095", gender: "girl" },
  { id: "girl-03", name: "Sabiya Shaikh", father_name: "Yaseen Shaikh", mobile: "9922874685", gender: "girl" },
  { id: "girl-04", name: "Fatima Tamboli", father_name: "Sadik Tamboli", mobile: "9823767857", gender: "girl" },
  { id: "girl-05", name: "Aliza Tamboli", father_name: "Shoyab Tamboli", mobile: "9730202496", gender: "girl" },
  { id: "girl-06", name: "Fatima Shah", father_name: "Usman Shah", mobile: "8459895293", gender: "girl" },
  { id: "girl-07", name: "Nida Shaikh", father_name: "Muhammad Shk", mobile: "9284815051", gender: "girl" },
  { id: "girl-08", name: "Aliya Shaikh", father_name: "Muhammad Shk", mobile: "9284815051", gender: "girl" },
  { id: "girl-09", name: "Khwaish Ali", father_name: "Roshan Ali", mobile: "6388221952", gender: "girl" },
  { id: "girl-10", name: "Namira Falak", father_name: "Naveed Sayyad", mobile: "9595308109", gender: "girl" },
  { id: "girl-11", name: "Samiya Shaikh", father_name: "Yaseen Shaikh", mobile: "9922874685", gender: "girl" },
  { id: "girl-12", name: "Alina Sayyad", father_name: "Akbar Sayyad", mobile: "7350664251", gender: "girl" },
  { id: "girl-13", name: "Sumayya Alamel", father_name: "Nabi Rasul Alamel", mobile: "9860258779", gender: "girl" },
  { id: "girl-14", name: "Alfa", father_name: "Ali Hasan", mobile: "8983052278", gender: "girl" },
  { id: "girl-15", name: "Hina Ansari", father_name: "Asgar Ansari", mobile: "", gender: "girl" },
  { id: "girl-16", name: "Arfa Shaikh", father_name: "Shafik Shaikh", mobile: "8806535813", gender: "girl" },
  { id: "girl-17", name: "Mehak Hawaldar", father_name: "Shakir Hawaldar", mobile: "9970234289", gender: "girl" },
  { id: "girl-18", name: "Naaz Sayyad", father_name: "Sajid Sayyad", mobile: "", gender: "girl" },
  { id: "girl-19", name: "Ilma Khan", father_name: "Irshad Khan", mobile: "9175363517", gender: "girl" },
  { id: "girl-20", name: "Ajia Khan", father_name: "Irshad Khan", mobile: "9175363517", gender: "girl" },
  { id: "girl-21", name: "Fatima Pathan", father_name: "Umar Pathan", mobile: "8668701762", gender: "girl" },
  { id: "girl-22", name: "Mahira Shikh", father_name: "Mudassir Shaikh", mobile: "7972921078", gender: "girl" },
  { id: "girl-23", name: "Ahana Sayyad", father_name: "Sajid Sayyad", mobile: "", gender: "girl" },
  { id: "girl-24", name: "Anam Shaikh", father_name: "Javeed Shaikh", mobile: "", gender: "girl" },
  { id: "girl-25", name: "Iqra Tamboli", father_name: "Salim Tamboli", mobile: "9579409191", gender: "girl" }
];

const GIRL_NAME_SET = new Set([
  "Sana Tamboli", "Aliya Tamboli", "Sabiya Shaikh", "Fatima Tamboli", "Aliza Tamboli",
  "Fatima Shah", "Nida Shaikh", "Aliya Shaikh", "Khwaish Ali", "Namira Falak",
  "Samiya Shaikh", "Alina Sayyad", "Sumayya Alamel", "Alfa", "Hina Ansari",
  "Arfa Shaikh", "Mehak Hawaldar", "Naaz Sayyad", "Ilma Khan", "Ajia Khan",
  "Fatima Pathan", "Mahira Shikh", "Ahana Sayyad", "Anam Shaikh", "Iqra Tamboli"
]);

const DB = {
  STORAGE_KEYS: {
    STUDENTS: "maktab_db_students_v3",
    ATTENDANCE: "maktab_db_attendance_v3",
    SABAK: "maktab_db_sabak_v3"
  },

  initLocalStore() {
    if (!localStorage.getItem(this.STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(REAL_STUDENTS_SEED));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(this.STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.SABAK)) {
      localStorage.setItem(this.STORAGE_KEYS.SABAK, JSON.stringify([]));
    }
  },

  // --------------------------------------------------------------------------
  // STUDENTS API
  // --------------------------------------------------------------------------
  async getStudents(searchQuery = "", genderFilter = "all") {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        let query = supabase.from("students").select("id, name, father_name, mobile").order("name");

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim();
          query = query.or(`name.ilike.%${q}%,father_name.ilike.%${q}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          data.forEach(s => {
            s.gender = GIRL_NAME_SET.has(s.name) ? "girl" : "boy";
          });

          if (genderFilter && genderFilter !== "all") {
            return data.filter(s => s.gender === genderFilter);
          }
          return data;
        }
      } catch (err) {
        console.warn("Supabase query error:", err);
      }
    }

    // Local Storage (54 Real Students)
    this.initLocalStore();
    try {
      let list = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS) || "[]");

      if (genderFilter && genderFilter !== "all") {
        list = list.filter(s => s.gender === genderFilter);
      }

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        list = list.filter(s =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.father_name && s.father_name.toLowerCase().includes(q))
        );
      }

      return list;
    } catch (e) {
      return REAL_STUDENTS_SEED;
    }
  },

  async getStudentById(studentId) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("id, name, father_name, mobile, gender")
          .eq("id", studentId)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {}
    }

    this.initLocalStore();
    const list = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS) || "[]");
    return list.find(s => s.id === studentId) || null;
  },

  async createStudent({ name, father_name, mobile, gender = "boy" }) {
    if (!name || !name.trim()) throw new Error("Student name is required.");
    if (!father_name || !father_name.trim()) throw new Error("Father name is required.");

    const payload = {
      name: name.trim(),
      father_name: father_name.trim(),
      mobile: (mobile || "").trim(),
      gender: gender === "girl" ? "girl" : "boy"
    };

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("students").insert([payload]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase insert error, falling back locally:", err);
      }
    }

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

  async updateStudent(studentId, { name, father_name, mobile, gender }) {
    if (!name || !name.trim()) throw new Error("Student name is required.");
    if (!father_name || !father_name.trim()) throw new Error("Father name is required.");

    const payload = {
      name: name.trim(),
      father_name: father_name.trim(),
      mobile: (mobile || "").trim(),
      gender: gender === "girl" ? "girl" : "boy"
    };

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("students")
          .update(payload)
          .eq("id", studentId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {}
    }

    this.initLocalStore();
    const students = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS) || "[]");
    const idx = students.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...payload, updated_at: new Date().toISOString() };
      localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      return students[idx];
    }
    throw new Error("Student not found.");
  },

  async deleteStudent(studentId) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        await supabase.from("students").delete().eq("id", studentId);
      } catch (e) {}
    }

    this.initLocalStore();
    let students = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS) || "[]");
    students = students.filter(s => s.id !== studentId);
    localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));

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
  async getAttendanceMapForDate(dateStr) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("attendance")
          .select("student_id, status")
          .eq("attendance_date", dateStr);
        if (!error && data) {
          const map = {};
          data.forEach(row => { map[row.student_id] = row.status; });
          return map;
        }
      } catch (e) {}
    }

    this.initLocalStore();
    const attendance = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE) || "[]");
    const map = {};
    attendance
      .filter(a => a.attendance_date === dateStr)
      .forEach(row => { map[row.student_id] = row.status; });
    return map;
  },

  async markAttendance(studentId, dateStr, status) {
    if (!["present", "absent"].includes(status)) {
      throw new Error("Invalid status. Must be 'present' or 'absent'.");
    }

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        await supabase.from("attendance").upsert(
          { student_id: studentId, attendance_date: dateStr, status: status },
          { onConflict: "student_id,attendance_date" }
        );
      } catch (e) {}
    }

    this.initLocalStore();
    const attendance = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE) || "[]");
    const idx = attendance.findIndex(a => a.student_id === studentId && a.attendance_date === dateStr);

    if (idx !== -1) {
      attendance[idx].status = status;
      attendance[idx].updated_at = new Date().toISOString();
    } else {
      attendance.push({
        id: "att-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        student_id: studentId,
        attendance_date: dateStr,
        status: status,
        created_at: new Date().toISOString()
      });
    }
    localStorage.setItem(this.STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    return { student_id: studentId, attendance_date: dateStr, status };
  },

  async getStudentMonthlyAttendance(studentId, year, month) {
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const daysInMonth = DateUtils.getDaysInMonth(year, month);
    const endDate = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("attendance")
          .select("attendance_date, status")
          .eq("student_id", studentId)
          .gte("attendance_date", startDate)
          .lte("attendance_date", endDate);

        if (!error && data) {
          let presentCount = 0;
          let absentCount = 0;
          const recordsMap = {};
          data.forEach(row => {
            recordsMap[row.attendance_date] = row.status;
            if (row.status === "present") presentCount++;
            else if (row.status === "absent") absentCount++;
          });
          return { presentCount, absentCount, recordsMap };
        }
      } catch (e) {}
    }

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
  async getStudentSabakForDate(studentId, dateStr) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("sabak")
          .select("completed")
          .eq("student_id", studentId)
          .eq("sabak_date", dateStr)
          .maybeSingle();

        if (!error && data) return { completed: data.completed };
      } catch (e) {}
    }

    this.initLocalStore();
    const list = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SABAK) || "[]");
    const rec = list.find(s => s.student_id === studentId && s.sabak_date === dateStr);
    return rec ? { completed: rec.completed } : null;
  },

  async getSabakMapForDate(dateStr) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("sabak")
          .select("student_id, completed")
          .eq("sabak_date", dateStr);

        if (!error && data) {
          const map = {};
          data.forEach(r => { map[r.student_id] = r.completed; });
          return map;
        }
      } catch (e) {}
    }

    this.initLocalStore();
    const list = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SABAK) || "[]");
    const map = {};
    list
      .filter(s => s.sabak_date === dateStr)
      .forEach(r => { map[r.student_id] = r.completed; });
    return map;
  },

  async saveSabak(studentId, dateStr, completed) {
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        await supabase.from("sabak").upsert(
          { student_id: studentId, sabak_date: dateStr, completed: completed },
          { onConflict: "student_id,sabak_date" }
        );
      } catch (e) {}
    }

    this.initLocalStore();
    const list = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SABAK) || "[]");
    const idx = list.findIndex(s => s.student_id === studentId && s.sabak_date === dateStr);

    if (idx !== -1) {
      list[idx].completed = completed;
      list[idx].updated_at = new Date().toISOString();
    } else {
      list.push({
        id: "sbk-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        student_id: studentId,
        sabak_date: dateStr,
        completed: completed,
        created_at: new Date().toISOString()
      });
    }
    localStorage.setItem(this.STORAGE_KEYS.SABAK, JSON.stringify(list));
    return { student_id: studentId, sabak_date: dateStr, completed };
  }
};

window.DB = DB;
