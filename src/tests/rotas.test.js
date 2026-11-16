const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');

// Um token válido, com o mesmo segredo que o autenticar confere
const token = jwt.sign({ id: 1, nome: 'Teste' }, process.env.JWT_SECRET);

// O logger, o temporizador e o tratarErros escrevem no terminal
jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

describe('rotas da API', () => {
    test('GET / responde 200 com a mensagem da API', async () => {
        const resposta = await request(app).get('/');

        expect(resposta.status).toBe(200);
        expect(resposta.body).toEqual({
            mensagem: 'TaskFlow API funcionando!',
        });
    });
    test('rota que não existe responde 404', async () => {
        const resposta = await request(app).get('/nao-existe');

        expect(resposta.status).toBe(404);
        expect(resposta.body.erro.mensagem).toBe('Rota não encontrada');
    });
    test('GET /tarefas sem token responde 401', async () => {
        const resposta = await request(app).get('/tarefas');

        expect(resposta.status).toBe(401);
    });
    test('GET /tarefas com token falso responde 401', async () => {
        const resposta = await request(app)

            .get('/tarefas')
            .set('Authorization', 'Bearer abc.def.ghi');

        expect(resposta.status).toBe(401);
    });
    test('POST /tarefas inválido responde 400', async () => {
        const resposta = await request(app)

            .post('/tarefas')
            .set('Authorization', `Bearer ${token}`)
            .send({ texto: '' });

        expect(resposta.status).toBe(400);
        expect(resposta.body.erro.mensagem).toBe('Dados inválidos');
    });
    test('POST /tarefas sem JSON responde 415', async () => {
        const resposta = await request(app)

            .post('/tarefas')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'text/plain')
            .send('texto solto');

        expect(resposta.status).toBe(415);
    });

});