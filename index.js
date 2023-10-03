import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
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
  createNewShopItemValidation,
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
import {
  createAdmin,
  createShopItem,
  deleteShopItem,
  getAdmin,
  getAllUsers,
  getUserData,
  getUserGoods,
  loginAdmin,
} from "./controllers/adminControlles.js";
import checkAdmin from "./checkAdmin.js";
const app = express();

const PORT = process.env.PORT || 4444;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/", (_req, res) => {
  res.send("Server work)");
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads");
  },
  filename: async (req, file, cb) => {
    const fileName = file.originalname;
    const filePath = `uploads/${fileName}`;

    try {
      const files = await fs.promises.readdir("uploads");
      if (files.includes(fileName)) {
        req.fileExists = true;
      }

      cb(null, fileName);
    } catch (err) {
      console.error(err);
      cb(err);
    }
  },
});
const upload = multer({ storage });

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

app.post("/admin-login", loginAdmin);
app.post("/admin-create", createAdmin);
app.get("/get-admin/", checkAuth, checkAdmin, getAdmin);

app.get("/get-users", checkAdmin, getAllUsers);
app.get("/get-user-data/:userId", checkAdmin, getUserData);
app.get("/get-user-goods/:userId", checkAdmin, getUserGoods);

app.post("/upload", upload.single("image"), async (req, res) => {
  const fileName = req.file.originalname;

  if (req.fileExists) {
    return res
      .status(400)
      .json({ message: "File with this name already exist" });
  } else {
    return res.json({
      url: `${fileName}`,
    });
  }
});

app.delete("/upload/:imageName", checkAdmin, (req, res) => {
  const { imageName } = req.params;
  const imagePath = `uploads/${imageName}`;
  try {
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error deleting file" });
      } else {
        return res.json({ message: "File deleted succesfully" });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.post(
  "/shop-item",
  checkAdmin,
  createNewShopItemValidation,
  handleValidationErrors,
  createShopItem
);

app.delete("/shop-item/:productId", checkAdmin, deleteShopItem);

try {
  app.listen(PORT, () => {
    console.log(`Server was started on port ${PORT}`);
  });
} catch (error) {
  console.log(error);
}
