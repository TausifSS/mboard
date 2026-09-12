/**
 * MAKTAB MANAGEMENT SYSTEM - ADVERTISEMENT SERVICE (FUTURE USE)
 * 
 * In accordance with Requirement 19:
 * Advertisements are CURRENTLY DISABLED (ADS = OFF).
 * This service maintains the architectural foundation for future product/ad display
 * (e.g., Islamic books, miswak, stationery) without altering application screens.
 */

const AdsService = {
  // Global flag: advertisements remain disabled in this release
  isAdsEnabled() {
    return Boolean(window.MAKTAB_CONFIG && window.MAKTAB_CONFIG.ADS_ENABLED === true);
  },

  /**
   * Fetches active advertisements when ADS_ENABLED is toggled on in the future.
   * Returns empty array while ADS = OFF.
   */
  async getActiveAds() {
    if (!this.isAdsEnabled()) {
      return [];
    }

    const supabase = SupabaseClientModule.getClient();
    if (supabase) {
      try {
        const today = DateUtils.getTodayDateString();
        const { data, error } = await supabase
          .from("advertisements")
          .select("id, title, description, image_url, link, start_date, end_date")
          .eq("active", true)
          .or(`start_date.is.null,start_date.lte.${today}`)
          .or(`end_date.is.null,end_date.gte.${today}`);

        if (error) {
          console.warn("Ads query error:", error);
          return [];
        }
        return data || [];
      } catch (err) {
        return [];
      }
    }
    return [];
  },

  /**
   * Placeholder mount point for future ad container rendering.
   * Does not render anything when ADS = OFF.
   */
  mountAdSlot(containerElement) {
    if (!this.isAdsEnabled() || !containerElement) {
      return;
    }
    // Future ad DOM rendering hook
  }
};

window.AdsService = AdsService;
