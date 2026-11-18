const prioridadeModel = require("../models/prioridades.model");

module.exports = {
    async listar(req, res) {
        const resultado = await prioridadeModel.listar(req.query);
        return res.json(resultado);
    },
};