// lib/Database/Models/User.ts
import mongoose, { Schema, Document, model, models } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  isVerified?: boolean
  isOAuth?: boolean
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function(this: IUser) { return !this.isOAuth; }, // Only require a password if it's not an OAuth user
    minlength: [6, 'Password must be at least 6 characters long'],
    trim: true
  },
  isVerified: { type: Boolean, default: false },
  isOAuth: { type: Boolean, default: false }, // Add this line
})

export const User = models.User || model<IUser>("User", UserSchema)