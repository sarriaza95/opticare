const pool = require("../models/db");

const getImages = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, created_at FROM images"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadImage = async (req, res) => {
  const { title, description } = req.body;
  const image = req.file?.buffer;

  if (!image) {
    return res.status(400).json({ error: "Image file is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO images (title, description, image) VALUES ($1, $2, $3) RETURNING *",
      [title, description, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateImage = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const image = req.file?.buffer;

  try {
    const result = await pool.query(
      `UPDATE images SET title = $1, description = $2, image = COALESCE($3, image) WHERE id = $4 RETURNING *`,
      [title, description, image, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getImages, uploadImage, updateImage };
