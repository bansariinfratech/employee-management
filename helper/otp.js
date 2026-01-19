export const generateOtp = () =>{
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const hashPassword = async(password)=>{
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}