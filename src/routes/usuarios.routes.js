const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuarios.controller");

const validar = require("../middlewares/validar");
const schemas = require("../middlewares/schemas");
const idValido = validar(schemas.id, "params");

router.get("/", usuariosController.listar);
//-----------------------------------------------------------------
router.post("/", validar(schemas.usuario), usuariosController.criar);
//---------------------------------------------------------------
router.get("/:id", idValido, usuariosController.buscarPorId);
//-------------------------------------------------------------
router.put("/:id", idValido, validar(schemas.usuario), usuariosController.atualizar);
//----------------------------------------------------------------
router.delete("/:id", idValido, usuariosController.remover);

module.exports = router;