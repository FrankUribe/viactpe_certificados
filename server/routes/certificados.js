const express = require("express");
const multer = require('multer');
const path = require('path');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../config/database");
const router = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'certificados/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.pdf`);
    // cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Ruta para subir archivos
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    res.json({ success: true, message: 'Archivo subido correctamente', file: req.file, });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al subir archivo', error, });
  }
});

router.post("/certificados", (req, res) => {
  const { METODO, NRO_DOC, LIBRO, FOLIO, NUMERO, XMLDOC } = req.body;
  connection.query("CALL SP_CRUD_ALUMNOS_CERTIFICADOS(?, ?, ?, ?, ?, ?)", [METODO, NRO_DOC, LIBRO, FOLIO, NUMERO, XMLDOC], (error, results, fields) => {
    if (error) {
      res.status(500).json({ success: false, message: error });
    } else {
      res.json({ success: true, data: results[0] });
    }
  });
});

router.post("/login", async (req, res) => {
  const { USUARIO, CONTRA, cookieAccess } = req.body;
  
  async function compareIt(password, hpwd, data) {
    const isPasswordValid = await bcrypt.compare(password, hpwd)
    if (!isPasswordValid) {
      return res.json({ status: true, data: {MSG: "Contraseñas no coinciden", RESULTADO: 0} });
    } else {
      return res.json({ status: true, data });
    }
  }

  if (cookieAccess === true) {
    connection.query("CALL LOGIN(?, ?, ?, NULL)", [IDUSUARIO, CONTRA], async (error, results, fields) => {
      if (error) {
        res.status(500).json({ status: false, message: error });
      } else {
        res.json({ status: true, data: results[0][0] });
      }
    });
  } else {
    connection.query("CALL LOGIN(?, ?, ?, NULL)", [IDUSUARIO, ''], async (error, results, fields) => {
      if (error) {
        res.status(500).json({ status: false, message: error });
      } else {
        // console.log(results[0][0])
        if (results[0][0].CONTRA) {
          compareIt(CONTRA, results[0][0].CONTRA, results[0][0]);
        } else {
          res.json({ status: true, data: results[0][0] });
        }
      }
    });
  }
});


module.exports = router;
