import pool from "../db.js";
import bcrypt from "bcrypt";

// GET /api/usuarios_system -> obtener todos los usuarios del sistema
export const getUsuariosSystem = async (req, res) => {
  try {
    // Paginación opcional: ?page=1&limit=10
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 50;
    const offset = (page - 1) * limit;

    const totalResult = await pool.query("SELECT COUNT(*) FROM usuarios_login");
    const total = parseInt(totalResult.rows[0].count);

    const result = await pool.query(
      "SELECT id, username, role_id, created_at FROM usuarios_login ORDER BY id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json({
      message: "Usuarios del sistema obtenidos correctamente",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: result.rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al obtener usuarios del sistema" });
  }
};

// GET /api/usuarios_system/:id -> obtener un usuario por id
export const getUsuarioSystemById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, username, role_id, created_at FROM usuarios_login WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Usuario no encontrado` });
    }

    res.json({
      message: "Usuario obtenido correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// POST /api/usuarios_system -> crear un usuario del sistema
export const createUsuarioSystem = async (req, res) => {
  const { username, password, role_id } = req.body;

  // Validación de campos obligatorios
  const missingFields = [];
  if (!username) missingFields.push("username");
  if (!password) missingFields.push("password");
  if (!role_id) missingFields.push("role_id");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Faltan los siguientes campos obligatorios: ${missingFields.join(
        ", "
      )}`,
    });
  }

  try {
    // Hash del password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      "INSERT INTO usuarios_login (username, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, username, role_id, created_at",
      [username, password_hash, role_id]
    );

    res.status(201).json({
      message: "Usuario del sistema creado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    if (error.code === "23505") {
      // Unique violation
      res.status(400).json({ message: "El username ya existe" });
    } else {
      res
        .status(500)
        .json({ message: "Error al crear usuario", error: error.message });
    }
  }
};

// PUT /api/usuarios_system/:id -> actualizar un usuario del sistema
export const updateUsuarioSystem = async (req, res) => {
  const { id } = req.params;
  const { username, password, role_id } = req.body;

  const missingFields = [];
  if (!username) missingFields.push("username");
  if (!role_id) missingFields.push("role_id");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Faltan los siguientes campos obligatorios: ${missingFields.join(
        ", "
      )}`,
    });
  }

  try {
    let query = "UPDATE usuarios_login SET username=$1, role_id=$2";
    const values = [username, role_id];

    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query +=
        ", password_hash=$3 WHERE id=$4 RETURNING id, username, role_id, created_at";
      values.push(password_hash, id);
    } else {
      query += " WHERE id=$3 RETURNING id, username, role_id, created_at";
      values.push(id);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      message: "Usuario del sistema actualizado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    if (error.code === "23505") {
      res.status(400).json({ message: "El username ya existe" });
    } else {
      res
        .status(500)
        .json({ message: "Error al actualizar usuario", error: error.message });
    }
  }
};

// DELETE /api/usuarios_system/:id -> eliminar un usuario del sistema
export const deleteUsuarioSystem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM usuarios_login WHERE id=$1 RETURNING id, username, role_id, created_at",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      message: "Usuario del sistema eliminado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "Error al eliminar usuario", error: error.message });
  }
};
