import pool from "../db.js";

export const addMyGoods = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const checkQuery = "SELECT * FROM mygoods WHERE user_id = $1";
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length > 0) {
      const existingProductIds = checkResult.rows[0].product_ids || [];

      if (existingProductIds.includes(productId)) {
        return res
          .status(400)
          .json({ message: "Product already exists for this user" });
      }

      const updatedProductIds = [...existingProductIds, productId];

      const updateQuery =
        "UPDATE mygoods SET product_ids = $1 WHERE user_id = $2";
      await pool.query(updateQuery, [updatedProductIds, userId]);

      res.status(200).json({
        message: "Product added successfully",
        productIds: updatedProductIds,
      });
    } else {
      const insertQuery =
        "INSERT INTO mygoods (user_id, product_ids) VALUES ($1, $2) RETURNING product_ids";
      const newProductIds = [productId];
      const insertResult = await pool.query(insertQuery, [
        userId,
        newProductIds,
      ]);

      // Отримуємо оновлений масив ідентифікаторів з результату вставки
      const updatedProductIds = insertResult.rows[0].product_ids;

      res.status(200).json({
        message: "Product added successfully",
        productIds: updatedProductIds,
      });
    }
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Failed to add product",
    });
  }
};

export const getMyGoods = async (req, res) => {
  const userId = req.params.id;

  try {
    const query = "SELECT * FROM mygoods WHERE user_id = $1";
    const data = await pool.query(query, [userId]);

    const productIds = data.rows[0]?.product_ids || [];
    if (productIds.length === 0) {
      return res.status(200).json({ message: "no items found" });
    } else {
      const getMyGoodsQuery = "SELECT * FROM goods WHERE id = ANY($1)";
      const goods = await pool.query(getMyGoodsQuery, [productIds]);

      res.status(200).json(goods.rows);
    }
  } catch (error) {
    console.error("Error fetching user's products:", error);
    res.status(500).json({
      message: "Failed to fetch user's products",
    });
  }
};

export const deleteMyGoods = async (req, res) => {
  const userId = req.params.id;
  try {
    const deleteQuery = "DELETE FROM mygoods WHERE user_id = $1";
    const result = await pool.query(deleteQuery, [userId]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "My goods deleted successfully" });
    } else {
      res.status(404).json({ message: "No my goods found to delete" });
    }
  } catch (error) {
    console.error("Error deleting my goods:", error);
    res.status(500).json({ message: "Failed to delete my goods" });
  }
};

export const deleteById = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.params.userId;
  try {
    const deleteByIdQuery =
      "UPDATE mygoods SET product_ids = ARRAY_REMOVE(product_ids, $1) WHERE user_id = $2;";
    const data = await pool.query(deleteByIdQuery, [productId, userId]);

    if (data.rowCount === 0) {
      res.status(404).json({ message: "Item not found for deletion." });
    } else {
      res.status(200).json({ message: "Item deleted successfully." });
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
