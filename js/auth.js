/**
 * MAKTAB MANAGEMENT SYSTEM - AUTHENTICATION MODULE
 * 
 * Secure Teacher Authentication
 * In accordance with strict security requirements:
 * 1. Plaintext teacher passcode is NEVER stored in frontend code.
 * 2. In Supabase mode, verification happens entirely on the PostgreSQL server via RPC.
 * 3. In Standalone/Demo mode, verification uses one-way SHA-256 cryptographic hashing.
 */

const AuthModule = {
  // Session storage key
  SESSION_KEY: "maktab_teacher_session_v1",

  // One-way cryptographic hash of the authorized teacher code for standalone mode
  // The plaintext code is NEVER in the frontend source code.
  _SECURE_AUTH_HASH: "9246f23682d7c9ab13a52e6a12b3d99692dcc812452fd42c13ac42dbb5ac38ff",

  /**
   * Internal helper to compute SHA-256 in browser
   */
  async _computeSha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  },

  /**
   * Verifies the entered teacher passcode securely.
   * @param {string} enteredCode 
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async verifyTeacherAccess(enteredCode) {
    if (!enteredCode || typeof enteredCode !== "string") {
      return { success: false, error: "Please enter your teacher access code." };
    }

    const trimmedCode = enteredCode.trim();

    // Check if Supabase client is connected
    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc("verify_teacher_passcode", {
          entered_passcode: trimmedCode
        });

        if (error) {
          console.error("Supabase teacher auth error:", error);
          return { success: false, error: "Authentication service error. Please try again." };
        }

        if (data === true) {
          this._createSession();
          return { success: true };
        } else {
          return { success: false, error: "Invalid teacher access code." };
        }
      } catch (err) {
        console.error("Auth RPC exception:", err);
        return { success: false, error: "Unable to verify credentials. Please check connection." };
      }
    }

    // Standalone fallback using client-side one-way SHA-256 comparison
    try {
      const computedHash = await this._computeSha256(trimmedCode);
      if (computedHash === this._SECURE_AUTH_HASH) {
        this._createSession();
        return { success: true };
      } else {
        return { success: false, error: "Invalid teacher access code." };
      }
    } catch (err) {
      console.error("Local hash verification error:", err);
      return { success: false, error: "Authentication failed." };
    }
  },

  /**
   * Creates an authenticated teacher session
   */
  _createSession() {
    const sessionPayload = {
      role: "teacher",
      authenticatedAt: new Date().toISOString(),
      token: "tch_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionPayload));
    window.dispatchEvent(new CustomEvent("maktab:auth_changed", { detail: { authenticated: true } }));
  },

  /**
   * Returns true if teacher is currently authenticated
   */
  isTeacherAuthenticated() {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed && parsed.role === "teacher" && Boolean(parsed.token);
    } catch (e) {
      return false;
    }
  },

  /**
   * Terminates the current teacher session
   */
  logoutTeacher() {
    sessionStorage.removeItem(this.SESSION_KEY);
    window.dispatchEvent(new CustomEvent("maktab:auth_changed", { detail: { authenticated: false } }));
  }
};

window.AuthModule = AuthModule;
