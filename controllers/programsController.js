import pool from "../db.js";

export const getPrograms = async (req, res) => {
  try {
    const programs = await pool.query("SELECT * FROM programs");
    res.json(programs.rows);
  } catch (error) {
    console.error(`Error fetching programs: ${error} `);
    res.status(500).json({
      message: "Can't get data",
    });
  }
};
