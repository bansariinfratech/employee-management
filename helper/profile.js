import RegisterModel from "../model/register.model.js";

export const finduserById = async (id) => {
  return await RegisterModel.findById(id);
};

export const FindUserByEmail = async (email) => {
  return await RegisterModel.findOne({ email });
};

export const FindByIdAndUpdate = async (userId, updateProfileData) => {
  return await RegisterModel.findByIdAndUpdate(
    userId,
    { $set: updateProfileData },
    { new: true, runValidators: true },
  );
};

export const updateUser = async (user) => {
  return await user.save();
};
