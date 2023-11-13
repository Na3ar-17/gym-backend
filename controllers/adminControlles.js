import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import JWT_SECRET_KEY from "../KEYS.js";
import fs from "fs";

export const createAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const isAdminExistQuery = "SELECT * FROM admins WHERE email = $1";
    const isAdminExist = await pool.query(isAdminExistQuery, [email]);

    if (isAdminExist.rowCount > 0) {
      return res.json({
        message: `Admin with email: ${email}, already exists`,
      });
    } else {
      const passwordHash = await bcrypt.hash(password.trim(), 10);

      const adminInsertQuery =
        "INSERT INTO admins (email ,password) VALUES ($1,$2) RETURNING id";

      const admin = await pool.query(adminInsertQuery, [email, passwordHash]);
      const adminId = admin.rows[0].id;
      const role = "admin";
      const token = jwt.sign({ adminId, role }, JWT_SECRET_KEY, {
        expiresIn: "30d",
      });

      const createAdminMessage = `Registration successful`;
      return res.status(201).json({
        message: createAdminMessage,
        adminId,
        adminToken: token,
      });
    }
  } catch (error) {
    console.error(`Registration error: ${error}`);
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const findAdminQuery = "SELECT * FROM admins WHERE email = $1";
    const adminResult = await pool.query(findAdminQuery, [email]);

    if (adminResult.rowCount === 0) {
      return res.status(404).json({
        message: "No accesse",
      });
    } else {
      const admin = adminResult.rows[0];
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return res.status(400).json({
          message: "No accesse",
        });
      } else {
        const adminId = admin.id;
        const role = "admin";

        const token = jwt.sign({ adminId, role }, JWT_SECRET_KEY, {
          expiresIn: "30d",
        });

        res.json({ adminId: adminId, adminToken: token });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error login admin",
    });
  }
};

export const getAdmin = async (req, res) => {
  const adminId = req.adminId;
  try {
    const findAdminQuery = "SELECT * FROM admins WHERE id = $1";
    const adminResult = await pool.query(findAdminQuery, [adminId]);

    if (adminResult.rowCount === 0) {
      return res.status(404).json({
        message: "No admin found",
      });
    } else {
      const admin = adminResult.rows[0];
      res.json({ adminId: admin.id });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "No access",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const getAllUsersQuery = "SELECT email,fullname,id FROM users;";
    const usersData = await pool.query(getAllUsersQuery);

    if (usersData.rowCount === 0) {
      res.status(404).json({ message: "No users found" });
    } else {
      res.status(200).json(usersData.rows);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserData = async (req, res) => {
  const userId = req.params.userId;
  try {
    const getUserDataQuery = "SELECT email, fullname FROM users WHERE id = $1";
    const userDataResult = await pool.query(getUserDataQuery, [userId]);

    if (userDataResult.rowCount === 0) {
      res.status(404).json({ message: "No user found" });
    } else {
      const userData = userDataResult.rows[0];
      res.status(200).json([userData]);
    }
  } catch (error) {
    console.error("Error in getUserData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserGoods = async (req, res) => {
  const userId = req.params.userId;
  try {
    const getUserGoodsIdsQuery =
      "SELECT product_ids FROM mygoods WHERE user_id = $1";
    const userGoodsIdsResult = await pool.query(getUserGoodsIdsQuery, [userId]);

    const productIds =
      userGoodsIdsResult.rowCount > 0
        ? userGoodsIdsResult.rows[0].product_ids
        : [];

    if (productIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    const getUserGoodsQuery = "SELECT * FROM goods WHERE id = ANY($1);";
    const userGoodsResult = await pool.query(getUserGoodsQuery, [productIds]);
    const data = userGoodsResult.rows;

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getUserGoods:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createShopItem = async (req, res) => {
  const { name, category, price, raiting, info, img } = req.body;

  try {
    const createNewShopItemQuery =
      "INSERT INTO goods (name,  category, price, raiting, info,img) VALUES ($1, $2, $3, $4, $5,$6) RETURNING id";

    const createNewShopItemResult = await pool.query(createNewShopItemQuery, [
      name,
      category,
      price,
      raiting,
      info,
      img,
    ]);
    const newProductId = createNewShopItemResult.rows[0].id;

    res.json({ id: newProductId });
  } catch (error) {
    res.status(500).json({
      message: "Error creating the product",
    });
    console.error(error);
  }
};

export const deleteShopItem = async (req, res) => {
  const productId = req.params.productId;
  try {
    const getFileNameQuery = "SELECT img FROM goods WHERE id = $1";
    const { rows } = await pool.query(getFileNameQuery, [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Shop item not found" });
    }

    const deleteQuery = "DELETE FROM goods WHERE id = $1";
    await pool.query(deleteQuery, [productId]);

    const fileName = rows[0].img;
    const filePath = `uploads/${fileName}`;
    fs.unlinkSync(filePath);

    res.json({ message: "Shop item deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editShopCard = async (req, res) => {
  const { productId } = req.params;
  const { category, name, price, img, raiting, info } = req.body;

  try {
    const getProductQuery = "SELECT * FROM goods WHERE id = $1;";
    const currentProductResult = await pool.query(getProductQuery, [productId]);
    const currentProduct = currentProductResult.rows[0];

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    const updatedProduct = {
      name: name || currentProduct.name,
      category: category || currentProduct.category,
      price: price || currentProduct.price,
      img: img || currentProduct.img,
      raiting: raiting || currentProduct.raiting,
      info: info || currentProduct.info,
    };

    const updateProductQuery = `
        UPDATE goods
        SET category = $1, price = $2, name = $3, img = $4, raiting = $5, info = $6
        WHERE id = $7
        RETURNING *;`;

    const updatedProductResult = await pool.query(updateProductQuery, [
      updatedProduct.category,
      updatedProduct.price,
      updatedProduct.name,
      updatedProduct.img,
      updatedProduct.raiting,
      updatedProduct.info,
      productId,
    ]);

    const finalUpdatedProduct = updatedProductResult.rows[0];

    res.status(200).json({
      data: finalUpdatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "Failed to update product",
    });
  }
};
