/**
 * Premium Helper Utility
 * Defines limits and features for Free and Premium tiers.
 */

export const TIERS = {
    FREE: {
        name: 'Free',
        limits: {
            fivem_servers: 1,
            ticket_categories: 2,
            social_platforms: 1,
            auto_messages: 1,
            auto_clear_slots: 1
        },
        features: {
            custom_bot: false,
            no_branding: false,
            custom_status: false,
            html_transcripts: false,
            advanced_logs: false
        }
    },
    PREMIUM: {
        name: 'Premium',
        limits: {
            fivem_servers: 5,
            ticket_categories: 15,
            social_platforms: 5,
            auto_messages: 10,
            auto_clear_slots: 10
        },
        features: {
            custom_bot: true,
            no_branding: true,
            custom_status: true,
            html_transcripts: true,
            advanced_logs: true
        }
    }
};

/**
 * Get the configuration for a guild based on its premium status
 * @param {boolean} isPremium 
 * @returns {Object} Tier configuration
 */
export const getTierConfig = (isPremium) => {
    return isPremium ? TIERS.PREMIUM : TIERS.FREE;
};

/**
 * Check if a guild has reached a specific limit
 * @param {string} limitKey - Key from TIERS.FREE.limits
 * @param {number} currentCount - Current count of items
 * @param {boolean} isPremium - Guild premium status
 * @returns {boolean} True if limit reached
 */
export const isLimitReached = (limitKey, currentCount, isPremium) => {
    const tier = getTierConfig(isPremium);
    return currentCount >= tier.limits[limitKey];
};

/**
 * Check if a feature is enabled for the guild
 * @param {string} featureKey - Key from TIERS.FREE.features
 * @param {boolean} isPremium - Guild premium status
 * @returns {boolean} True if feature enabled
 */
export const isFeatureEnabled = (featureKey, isPremium) => {
    const tier = getTierConfig(isPremium);
    return !!tier.features[featureKey];
};
