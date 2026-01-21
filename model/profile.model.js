import mongoose from "mongoose";
import Joi from "joi";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      required: true,
      unique: true,
    },

    dob: Date,
    location: String,
    profilePic: String,
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    role: {
      type: String,
      enum: ["Admin", "Employee", "Supervisor", "Manager"],
    },
  },
  { timestamps: true },
);

export const Profile = mongoose.model("Profile", profileSchema);
export default Profile;

export const ProfileSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "ID is required",
    "any.required": "ID is required",
  }),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  gender: Joi.string().valid("male", "female").optional(),
  role: Joi.string()
    .valid("Admin", "Employee", "Supervisor", "Manager")
    .optional(),
  dob: Joi.date().optional(),
  location: Joi.string().trim().optional(),
}).messages({
  "object.min": "ID and at least one field must be provided for update",
});
