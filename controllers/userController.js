import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import JWT_SECRET_KEY from "../KEYS.js";

export const registration = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const isUserExistQuery = "SELECT * FROM users WHERE email = $1";
    const isUserExist = await pool.query(isUserExistQuery, [email]);

    if (isUserExist.rowCount > 0) {
      return res.json({
        message: `User with email: ${email}, already exists`,
      });
    } else {
      const passwordHash = await bcrypt.hash(password.trim(), 10);

      const userInsertQuery =
        "INSERT INTO users (fullName, email ,password) VALUES ($1,$2,$3) RETURNING id";

      const user = await pool.query(userInsertQuery, [
        fullName.trim(),
        email,
        passwordHash,
      ]);
      const userId = user.rows[0].id;
      const token = jwt.sign({ userId }, JWT_SECRET_KEY, {
        expiresIn: "30d",
      });

      const registrationMessage = `Registration successful`;
      return res.status(201).json({
        message: registrationMessage,
        fullName,
        email,
        userId,
        token,
        id: userId,
      });
    }
  } catch (error) {
    console.error(`Registration error: ${error}`);
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUserQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await pool.query(findUserQuery, [email]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        message: "Incorrect login or password",
      });
    } else {
      const user = userResult.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json({
          message: "Incorrect login or password",
        });
      } else {
        const userId = user.id;
        const token = jwt.sign({ userId }, JWT_SECRET_KEY, {
          expiresIn: "30d",
        });

        res.json({ fullName: user.fullname, email, token, id: userId });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error login",
    });
  }
};

export const getMe = async (req, res) => {
  const userId = req.userId;
  try {
    const findUserByIdQuery = "SELECT * FROM users WHERE id = $1";
    const userResult = await pool.query(findUserByIdQuery, [userId]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        message: "No user found",
      });
    } else {
      const user = userResult.rows[0];
      res.json({ id: user.id, fullName: user.fullname, email: user.email });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "No access",
    });
  }
};
