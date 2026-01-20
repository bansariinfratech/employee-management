import RegisterModel from "../model/register.model.js";

export const findUserByEmail = async (email) => {
  return await RegisterModel.findOne({ email });
};

export const createUser = async (userData) => {
  const user = new RegisterModel(userData);
  return await user.save();
};

export const saveUser = async (user) => {
  return await user.save();
};
