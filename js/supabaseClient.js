/**
 * MAKTAB MANAGEMENT SYSTEM - SUPABASE CLIENT
 * Safely initializes Supabase client if credentials are configured.
 */

const SupabaseClientModule = {
  client: null,

  init() {
    const config = window.MAKTAB_CONFIG || {};
    const url = config.SUPABASE_URL ? config.SUPABASE_URL.trim() : "";
    const anonKey = config.SUPABASE_ANON_KEY ? config.SUPABASE_ANON_KEY.trim() : "";

    if (url && anonKey && !url.includes("xyzcompany") && typeof window.supabase !== "undefined") {
      try {
        this.client = window.supabase.createClient(url, anonKey);
        console.log("Connected to Supabase project:", url);
        return this.client;
      } catch (err) {
        console.warn("Could not initialize Supabase client:", err.message);
      }
    }
    this.client = null;
    return null;
  },

  getClient() {
    if (!this.client) {
      this.init();
    }
    return this.client;
  },

  isConfigured() {
    return this.getClient() !== null;
  }
};

window.SupabaseClientModule = SupabaseClientModule;
