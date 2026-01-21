import multer from "multer";

const storage = multer.memoryStorage();
// const uploadDir = "uploads";
// if(!fs.existsSync(uploadDir)){
//     fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//     destination: function(req,file,cb){
//         cb(null,uploadDir);
//     },
//     filename: function(req,file,cb){
//         const name = file.originalname.replace(/\s+/g,'-')
//         const uniquename = Date.now() + '-' + name;
//         cb(null,uniquename);
//     },
// });

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

export const upload = multer({ storage: storage, fileFilter: fileFilter });
