export const generateOtp = () =>{
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const hashPassword = async(password)=>{
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

export const getNowISO = () => {
  const now = new Date();
  const offset = 330;
  const istTime = new Date(now.getTime() + offset * 60000);

  return istTime.toISOString().replace("Z", "+05:30");
};

  