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
      nowcast: { type: Boolean, default: true }
    },
    appearance: {
      theme: { type: String, default: 'dark' },
      dynamicBg: { type: Boolean, default: true }
    },
    lifestyle: {
      activities: {
        running: { type: Boolean, default: true },
        cycling: { type: Boolean, default: true },
        driving: { type: Boolean, default: true },
        lawn: { type: Boolean, default: true },
        outdoor: { type: Boolean, default: true },
        fishing: { type: Boolean, default: true },
        sailing: { type: Boolean, default: true },
        golf: { type: Boolean, default: true },
        boating: { type: Boolean, default: true },
        beach: { type: Boolean, default: true },
        kite: { type: Boolean, default: true },
        winter: { type: Boolean, default: true },
        hiking: { type: Boolean, default: true },
        astronomy: { type: Boolean, default: true }
      },
      pollen: {
        tree: { type: Boolean, default: true },
        grass: { type: Boolean, default: true },
        ragweed: { type: Boolean, default: true }
      }
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
