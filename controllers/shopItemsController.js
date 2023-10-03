import pool from "../db.js";

export const getShopItems = async (req, res) => {
  const { page, pageSize } = req.query;
  const offset = (page - 1) * pageSize;
  try {
    const totalItemCountQuery = "SELECT COUNT(*) FROM goods";
    const totalItemCountResult = await pool.query(totalItemCountQuery);
    const totalItemCount = parseInt(totalItemCountResult.rows[0].count, 10);

    const shopItemsQuery = "SELECT * FROM goods LIMIT $1 OFFSET $2";
    const shopItems = await pool.query(shopItemsQuery, [pageSize, offset]);

    const totalPages = Math.ceil(totalItemCount / pageSize);

    res.json({
      totalPages: totalPages,
      currentPage: parseInt(page, 10),
      data: shopItems.rows,
    });
  } catch (error) {
    console.error(`Error fetching shopItems: ${error}`);
    res.status(500).json({
      message: "Can't get data",
    });
  }
};

export const getOneShopItem = async (req, res) => {
  const itemId = req.params.id;
  try {
    const shopItem = await pool.query("SELECT * FROM goods WHERE id = $1;", [
      itemId,
    ]);
    res.json(shopItem.rows);
  } catch (error) {
    console.error(`Error fetching shopItem: ${error} `);
    res.status(500).json({
      message: "Can't get data",
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const getCategoriesQuery = "SELECT DISTINCT category FROM goods;";
    const data = await pool.query(getCategoriesQuery);
    const result = data.rows;

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const sortByCategory = async (req, res) => {
  const category = req.params.category;
  try {
    const getProductByCategoryQuery =
      "SELECT * FROM goods WHERE category = $1;";
    const data = await pool.query(getProductByCategoryQuery, [category]);

    const result = data.rows;
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
