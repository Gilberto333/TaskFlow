require("dotenv").config();

const logger = require("./src/middlewares/logger");
const validarContentType = require("./src/middlewares/validarContentType");
const temporizador = require("./src/middlewares/temporizador");
const autenticar = require("./src/middlewares/autenticar");
// const cors = require("./src/middlewares/cors");
const tratarErros = require('./src/middlewares/erro.middleware');
const criarErro = require("./src/utils/criarErro");

const express = require("express");

const tarefasRoutes = require("./src/routes/tarefas.routes");
const usuariosRoutes = require("./src/routes/usuarios.routes");
const projetosRoutes = require("./src/routes/projetos.routes");
const authRoutes = require("./src/routes/auth.routes");
const prioridadeRoutes = require("./src/routes/prioridades.routes");

const swaggerUi = require('swagger-ui-express');
const openapi = require('./src/docs/openapi');
const SWAGGER_CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';

const app = express();
const cors = require("cors");

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400,
    }),
);

app.use(express.json());
app.use(validarContentType);
app.use(logger);
app.use(temporizador);
// app.use(cors);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, {
    customCssUrl: `${SWAGGER_CDN}/swagger-ui.css`,
    customJs: [
        `${SWAGGER_CDN}/swagger-ui-bundle.js`,
        `${SWAGGER_CDN}/swagger-ui-standalone-preset.js`,
    ],
}));

app.use("/auth", authRoutes);
// Lista usuarios -----------------------------------------
app.use("/usuarios", autenticar, usuariosRoutes);
// Lista tarefas e faz todo CRUD --------------------------
app.use("/tarefas", autenticar, tarefasRoutes);
// Lista projetos e faz todo CRUD --------------------------
app.use("/projetos", autenticar, projetosRoutes);

app.use("/prioridades", autenticar, prioridadeRoutes);

app.get("/", (req, res) => {
    res.status(200).json({ mensagem: "TaskFlow API funcionando!" });
});

// Rota 404
app.use((req, res) => {
    throw criarErro(404, "Rota não encontrada");
});

app.use(tratarErros);

module.exports = app;