const express = require("express");
const multer = require("multer");
const {
  getImages,
  uploadImage,
  updateImage,
} = require("../controllers/imagesController");

const upload = multer(); // Configuración para manejar imágenes en memoria
const router = express.Router();

router.get("/", getImages);
router.post("/", upload.single("image"), uploadImage);
router.put("/:id", upload.single("image"), updateImage);

module.exports = router;
