require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

const adotanteController = require('./controller/adotanteController');
const petController = require('./controller/petController');
const matchController = require('./controller/matchController');
const adocaoController = require('./controller/adocaoController');
const usuarioController = require('./controller/usuariocontroller');
const autenticarToken = require('./middleware/auth');

app.get('/', (req, res) => {
    res.status(200).json({ mensagem: 'PetMatch API funcionando!' });
});

app.get('/health', (req, res) => {
    const conexao = require('./database/connection');
    conexao.query('SELECT 1 AS conectado', (erro) => {
        if (erro) return res.status(503).json({ mensagem: 'API ativa, mas o banco não está acessível.' });
        res.json({ api: 'ok', banco: 'conectado' });
    });
});
app.get('/usuarios/protegido', autenticarToken, (req, res) => {
    res.json({
        mensagem: 'Acesso autorizado!',
        usuario: req.usuario
    });
});





app.use('/adotantes', adotanteController);
app.use('/pets', petController);
app.use('/match', matchController);
app.use('/adocao', adocaoController);
app.use('/usuarios', usuarioController);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`PetMatch API rodando em http://localhost:${PORT}`));
