import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
  image: String,
  role: {
    type: String,
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.User || mongoose.model('User', UserSchema);
