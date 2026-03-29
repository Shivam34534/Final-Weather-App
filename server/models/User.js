import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isTwoFactorEnabled: { type: Boolean, default: false },
  username: { type: String },
  phone: { type: String },
  address: { type: String },
  location: { type: String },
  settings: {
    units: {
      temp: { type: String, default: 'c' },
      wind: { type: String, default: 'kmh' },
      precip: { type: String, default: 'mm' },
      pressure: { type: String, default: 'hpa' },
      distance: { type: String, default: 'km' },
      time: { type: String, default: '12h' }
    },
    notifications: {
      severe: { type: Boolean, default: true },
      nowcast: { type: Boolean, default: true },
      summary: { type: String, default: 'morning' },
      thresholds: {
        uv: { type: Boolean, default: false },
        freeze: { type: Boolean, default: true }
      },
      dnd: { type: Boolean, default: false }
    },
    data: {
      provider: { type: String, default: 'open-meteo' },
      updateFreq: { type: String, default: 'manual' },
      bgRefresh: { type: Boolean, default: false }
    },
    appearance: {
      theme: { type: String, default: 'dark' },
      dynamicBg: { type: Boolean, default: true },
      iconParams: { type: String, default: 'default' }
    },
    privacy: {
      locationAccess: { type: String, default: 'while-using' },
      preciseLocation: { type: Boolean, default: true },
      shareData: { type: Boolean, default: false }
    },
    health: {
      pollen: {
        tree: { type: Boolean, default: true },
        grass: { type: Boolean, default: true },
        ragweed: { type: Boolean, default: true }
      },
      activity: { type: String, default: 'default' },
      haptic: { type: Boolean, default: true }
    }
  },
  history: [{
    city: String,
    lat: Number,
    lon: Number,
    searchedAt: { type: Date, default: Date.now }
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
