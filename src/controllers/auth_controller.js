import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  // Validación de campos obligatorios
  if (!username || !password) {
    return res.status(400).json({
      message: "Faltan campos obligatorios: username, password",
    });
  }

  try {
    // Hashear la contraseña
    const hash = await bcrypt.hash(password, 10); // 10 salt rounds

    // Obtener id del rol admin
    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE nombre='admin'"
    );

    if (!roleResult.rows[0]) {
      return res.status(500).json({
        message:
          "El rol 'admin' no existe. Por favor crea el rol antes de registrar un admin.",
      });
    }

    const roleId = roleResult.rows[0].id;

    // Insertar usuario en la BD
    const result = await pool.query(
      "INSERT INTO usuarios_login (username, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, username",
      [username, hash, roleId]
    );

    res.status(201).json({
      message: "Admin creado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === "23505") {
      // Violación de UNIQUE (username duplicado)
      res.status(400).json({ message: "El username ya existe" });
    } else {
      res.status(500).json({
        message: "Error al crear usuario",
        error: error.message,
      });
    }
  }
};

// --------------------------
// Login
// --------------------------
export const login = async (req, res) => {
  const { username, password } = req.body;

  // Validación de campos obligatorios
  if (!username || !password) {
    return res.status(400).json({
      message: "Faltan campos obligatorios: username, password",
    });
  }

  try {
    // Obtener usuario y rol
    const userResult = await pool.query(
      `SELECT u.id, u.username, u.password_hash, r.nombre as role
       FROM usuarios_login u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const user = userResult.rows[0];

    // Comparar contraseñas
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Ajustable según necesidades
    );

    res.json({
      message: "Login exitoso",
      data: { username: user.username, role: user.role },
      token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Error al hacer login",
      error: error.message,
    });
  }
};
