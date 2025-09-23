import { Router } from "express";
import pool from "../db.js"; // Conexión a PostgreSQL

const router = Router();

// GET /api/usuarios -> obtener todos los usuarios con paginación
router.get("/", async (req, res) => {
  try {
    // Paginación: ?page=1&limit=10
    let { page, limit } = req.query;
    page = parseInt(page) || 1; // página por defecto 1
    limit = parseInt(limit) || 50; // límite por defecto 10
    const offset = (page - 1) * limit;

    // Obtener total de registros
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM usuarios_enacal"
    );
    const total = parseInt(totalResult.rows[0].count);

    // Obtener usuarios con límite y offset
    const result = await pool.query(
      "SELECT * FROM usuarios_enacal ORDER BY id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    // Respuesta estandarizada
    res.json({
      message: "Usuarios obtenidos correctamente",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: result.rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// GET /api/usuarios/:id -> obtener un usuario por id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM usuarios_enacal WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `No se encontró un usuario en la base de datos`,
      });
    }

    res.json({
      message: "Usuario obtenido correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// POST /api/usuarios -> crear un nuevo usuario
router.post("/", async (req, res) => {
  const { nis, nombre, telefono, sucursal } = req.body;

  // Array para acumular campos faltantes
  const missingFields = [];
  if (!nis) missingFields.push("nis");
  if (!nombre) missingFields.push("nombre");
  if (!telefono) missingFields.push("telefono");
  if (!sucursal) missingFields.push("sucursal");

  // Si hay campos faltantes, devolvemos mensaje claro
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Faltan los siguientes campos obligatorios: ${missingFields.join(
        ", "
      )}`,
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO usuarios_enacal (nis, nombre, telefono, sucursal) VALUES ($1, $2, $3, $4) RETURNING *",
      [nis, nombre, telefono, sucursal]
    );

    res.status(201).json({
      message: "Usuario creado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === "23505") {
      // Violación de UNIQUE (nis)
      res.status(400).json({
        message: "El NIS ya existe en la base de datos",
      });
    } else {
      res.status(500).json({
        message: "Error al crear usuario",
        error: error.message,
      });
    }
  }
});

// PUT /api/usuarios/:id -> actualizar un usuario
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nis, nombre, telefono, sucursal } = req.body;

  // Validación de campos obligatorios
  const missingFields = [];
  if (!nis) missingFields.push("nis");
  if (!nombre) missingFields.push("nombre");
  if (!telefono) missingFields.push("telefono");
  if (!sucursal) missingFields.push("sucursal");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Faltan los siguientes campos obligatorios: ${missingFields.join(
        ", "
      )}`,
    });
  }

  try {
    const result = await pool.query(
      "UPDATE usuarios_enacal SET nis=$1, nombre=$2, telefono=$3, sucursal=$4 WHERE id=$5 RETURNING *",
      [nis, nombre, telefono, sucursal, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `No se encontró un usuario en la base de datos`,
      });
    }

    res.json({
      message: "Usuario actualizado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === "23505") {
      // Violación de UNIQUE (nis)
      res.status(400).json({
        message: "El NIS ya existe en la base de datos",
      });
    } else {
      res.status(500).json({
        message: "Error al actualizar usuario",
        error: error.message,
      });
    }
  }
});

// DELETE /api/usuarios/:id -> eliminar un usuario
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM usuarios_enacal WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `No se encontró un usuario en la base de datos`,
      });
    }

    res.json({
      message: "Usuario eliminado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
});

export default router;
