import pool from "../db.js";

export const getTrainers = async (req, res) => {
  try {
    const trainers = await pool.query("SELECT * FROM trainers");
    res.json(trainers.rows);
  } catch (error) {
    console.error(`Error fetching trainers: ${error} `);
    res.status(500).json({
      message: "Can't get data",
    });
  }
};
