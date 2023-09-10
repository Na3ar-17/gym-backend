import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getTrainers } from "./controllers/trainersController.js";
import { getPrograms } from "./controllers/programsController.js";
import { getTimeTable } from "./controllers/timeTableController.js";
import {
  getShopItems,
  getOneShopItem,
  getAllCategories,
  sortByCategory,
} from "./controllers/shopItemsController.js";
import { login, registration, getMe } from "./controllers/userController.js";
import {
  loginValidation,
  registrationValidation,
} from "./ErrorValidations/validations.js";
import handleValidationErrors from "./ErrorValidations/handleValidationErrors.js";
import checkAuth from "./checkAuth.js";
import {
  addMyGoods,
  deleteById,
  deleteMyGoods,
  getMyGoods,
} from "./controllers/myGoodsController.js";
const app = express();
const PORT = process.env.PORT || 4444;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Server work)");
});

app.get("/trainers", getTrainers);
app.get("/programs", getPrograms);
app.get("/time-table", getTimeTable);
app.get("/shop-items", getShopItems);
app.get("/shop/shop-item/:id", getOneShopItem);
app.get("/get-categories", getAllCategories);
app.get("/sort-by-category/:category", sortByCategory);

app.post("/auth/login", loginValidation, handleValidationErrors, login);

app.post(
  "/auth/registration",
  registrationValidation,
  handleValidationErrors,
  registration
);
app.get("/auth/me", checkAuth, getMe);

app.post("/add-product", checkAuth, addMyGoods);
app.get("/get-my-goods/:id", checkAuth, getMyGoods);
app.delete("/delete-my-goods/:id", checkAuth, deleteMyGoods);
app.delete("/delete-by-id/:userId/:productId", checkAuth, deleteById);

try {
  app.listen(PORT, () => {
    console.log(`Server was started on port ${PORT}`);
  });
} catch (error) {
  console.log(error);
}
