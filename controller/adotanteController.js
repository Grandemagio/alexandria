const express = require('express');
const router = express.Router();
const conexao = require('../database/connection');

const campos = ['espaco', 'atividade', 'tempo', 'experiencia', 'criancas', 'outros_pets'];
function validarPerfil(body) {
    return campos.every((campo) => body[campo] !== undefined && body[campo] !== null && body[campo] !== '');
}

// POST /adotantes - criar perfil de compatibilidade para um usuário já cadastrado
router.post('/', (req, res) => {
    const usuarioId = Number(req.body.usuario_id);
    if (!Number.isInteger(usuarioId) || usuarioId < 1 || !validarPerfil(req.body)) {
        return res.status(400).json({ mensagem: 'Informe usuario_id e todos os campos do perfil.' });
    }
    conexao.query("SELECT id, perfil FROM usuarios WHERE id = ?", [usuarioId], (erro, usuarios) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao consultar usuário.', erro: erro.message });
        if (!usuarios.length) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        if (usuarios[0].perfil !== 'adotante') return res.status(400).json({ mensagem: 'O usuário precisa ter perfil adotante.' });
        const sql = `INSERT INTO perfis_adotantes (usuario_id, espaco, atividade, tempo, experiencia, criancas, outros_pets)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [usuarioId, ...campos.map((campo) => req.body[campo])];
        conexao.query(sql, values, (erroInsert, resultado) => {
            if (erroInsert) {
                const status = erroInsert.code === 'ER_DUP_ENTRY' ? 409 : 400;
                return res.status(status).json({ mensagem: 'Não foi possível cadastrar o perfil.', erro: erroInsert.message });
            }
            res.status(201).json({ mensagem: 'Perfil do adotante cadastrado.', id: resultado.insertId, usuario_id: usuarioId });
        });
    });
});

// GET /adotantes/:usuario_id
router.get('/:usuario_id', (req, res) => {
    const usuarioId = Number(req.params.usuario_id);
    if (!Number.isInteger(usuarioId) || usuarioId < 1) return res.status(400).json({ mensagem: 'ID do usuário inválido.' });
    const sql = `SELECT p.*, u.nome, u.email FROM perfis_adotantes p
                 INNER JOIN usuarios u ON u.id = p.usuario_id WHERE p.usuario_id = ?`;
    conexao.query(sql, [usuarioId], (erro, resultados) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao buscar perfil.', erro: erro.message });
        if (!resultados.length) return res.status(404).json({ mensagem: 'Perfil do adotante não encontrado.' });
        res.json(resultados[0]);
    });
});

// PUT /adotantes/:usuario_id
router.put('/:usuario_id', (req, res) => {
    const usuarioId = Number(req.params.usuario_id);
    if (!Number.isInteger(usuarioId) || usuarioId < 1 || !validarPerfil(req.body)) {
        return res.status(400).json({ mensagem: 'Informe um ID válido e todos os campos do perfil.' });
    }
    const sql = `UPDATE perfis_adotantes SET espaco = ?, atividade = ?, tempo = ?, experiencia = ?, criancas = ?, outros_pets = ? WHERE usuario_id = ?`;
    const values = [...campos.map((campo) => req.body[campo]), usuarioId];
    conexao.query(sql, values, (erro, resultado) => {
        if (erro) return res.status(400).json({ mensagem: 'Erro ao atualizar perfil.', erro: erro.message });
        if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Perfil do adotante não encontrado.' });
        res.json({ mensagem: 'Perfil do adotante atualizado.' });
    });
});

module.exports = router;
