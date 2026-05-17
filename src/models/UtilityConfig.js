import mongoose from 'mongoose';

const utilityConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  allowedRoles: { type: [String], default: [] },
  logChannelId: { type: String, default: null },
  colors: {
      primary: { type: String, default: '#5865F2' },
      success: { type: String, default: '#2ecc71' },
      error: { type: String, default: '#ff4757' }
  },
  systemMessages: {
      type: Map,
      of: String,
      default: {}
  }
}, { timestamps: true });

export default mongoose.models.UtilityConfig || mongoose.model('UtilityConfig', utilityConfigSchema);
