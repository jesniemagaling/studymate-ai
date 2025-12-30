import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: String, //hashed
    image: String,
    role: { type: String, default: 'user' },
  },
  { timestamps: true }
);

export default models.User || mongoose.model('User', UserSchema);
