import mongoose from 'mongoose';

const utilityConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  allowedRoles: { type: [String], default: [] }
});

export default mongoose.models.UtilityConfig || mongoose.model('UtilityConfig', utilityConfigSchema);
