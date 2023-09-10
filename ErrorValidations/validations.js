import { body } from "express-validator";
export const loginValidation = [
  body("email", "Incorrect email format").isEmail(),
  body("password", "The password must contain at least 5 characters").isLength({
    min: 5,
  }),
];
export const registrationValidation = [
  body("email", "Incorrect email format").isEmail(),
  body("password", "The password must contain at least 5 characters").isLength({
    min: 5,
  }),
  body("fullName", "Enter your full name").isLength({ min: 3 }),
];
