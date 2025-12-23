import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  email: String,
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = models.User || model('User', UserSchema);
