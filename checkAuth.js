import jwt from "jsonwebtoken";
import JWT_SECRET_KEY from "./KEYS.js";

export default async (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      const userId = decoded.userId;
      req.userId = userId;
      next();
    } catch (error) {
      console.log(error);
      return res.status(403).json({
        message: "Немає доступу",
      });
    }
  } else {
    return res.status(403).json({
      message: "Немає доступу",
    });
  }
};
