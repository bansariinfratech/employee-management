import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    if (!authHeader) {
      return res.status(401).json({
        status: 401,
        message: "JWT token not provided",
      });
    }

    let token;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "JWT token not provided",
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: 401,
        message: "Invalid token",
        errors: error.message,
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: 401,
        message: "Token expired",
        errors: error.message,
      });
    }
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
      errors: error.message,
    });
  }
};
