import pool from "../db.js";

export const getTimeTable = async (req, res) => {
  try {
    const timeTable = await pool.query("SELECT * FROM timeTable");
    res.json(timeTable.rows);
  } catch (error) {
    console.error(`Error fetching timeTable: ${error} `);
    res.status(500).json({
      message: "Can't get data",
    });
  }
};
