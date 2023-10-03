import jwt from "jsonwebtoken";
import JWT_SECRET_KEY from "./KEYS.js";

export default async (req, res, next) => {
  const adminToken = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  if (adminToken) {
    try {
      const decoded = jwt.verify(adminToken, JWT_SECRET_KEY);
      const adminId = decoded.adminId;
      req.adminId = adminId;
      if (decoded.role === "admin") {
        next();
      } else {
        return res.status(403).json({
          message: "No admin access",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(403).json({
        message: "No access",
      });
    }
  } else {
    return res.status(403).json({
      message: "No access",
    });
  }
};
