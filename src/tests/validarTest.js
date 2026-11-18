test('id da URL: aceita "7" e barra "abc"', () => {

const middleware = validar(schemas.id, 'params');

const nextBom = jest.fn();

const nextRuim = jest.fn();

middleware({ params: { id: '7' } }, {}, nextBom);

const erro = pegarErro(() =>

middleware({ params: { id: 'abc' } }, {}, nextRuim));

expect(nextBom).toHaveBeenCalledTimes(1);

expect(erro.detalhes).toEqual([

"O campo 'id' deve ser inteiro positivo",

]);

expect(nextRuim).not.toHaveBeenCalled();

});