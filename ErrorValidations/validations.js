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

export const createNewShopItemValidation = [
  body("name", "Enter product name").isLength({ min: 3 }).isString(),
  body("img", "Incorect image").isString(),
  body("category", "Incorect category").isString().isUppercase(),
  body("price", "Incorect price").isNumeric(),
  body("raiting", "Incorect raiting").isNumeric(),
  body("info", "Incorect info").isLength({ min: 10 }).isString(),
];
