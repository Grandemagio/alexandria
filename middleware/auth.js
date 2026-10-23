
const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
    const cabecalho = req.headers.authorization;

    console.log('Authorization recebido:', req.headers.authorization);

    if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
        return res.status(401).json({
            mensagem: 'Token de autenticação não informado.'
        });
    }




    const token = cabecalho.split(' ')[1];

    try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = usuario;

        next();
    } catch (erro) {
        return res.status(403).json({
            mensagem: 'Token inválido ou expirado.'
        });
    }
}

module.exports = autenticarToken;
