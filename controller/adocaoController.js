const express = require('express');
const router = express.Router();
const conexao = require('../database/connection');
const statusPermitidos = ['solicitada', 'em_analise', 'aprovada', 'recusada', 'concluida'];

// GET /adocao - listar solicitações
router.get('/', (req, res) => {
    const sql = `SELECT a.id AS adocao_id, a.status, a.data_solicitacao, a.data_conclusao, a.observacoes,
                        an.id AS animal_id, an.nome AS animal_nome, an.especie, an.porte,
                        u.id AS adotante_id, u.nome AS adotante_nome, u.email AS adotante_email
                 FROM adocoes a
                 INNER JOIN animais an ON an.id = a.animal_id
                 INNER JOIN usuarios u ON u.id = a.adotante_id
                 ORDER BY a.data_solicitacao DESC, a.id DESC`;
    conexao.query(sql, (erro, resultados) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao consultar adoções.', erro: erro.message });
        res.json({ quantidade: resultados.length, adocoes: resultados });
    });
});

// GET /adocao/adotante/:usuario_id
router.get('/adotante/:usuario_id', (req, res) => {
    const usuarioId = Number(req.params.usuario_id);
    if (!Number.isInteger(usuarioId) || usuarioId < 1) return res.status(400).json({ mensagem: 'ID do adotante inválido.' });
    const sql = `SELECT a.id AS adocao_id, a.status, a.data_solicitacao, a.data_conclusao, a.observacoes,
                        an.id AS animal_id, an.nome AS animal_nome, an.especie, an.porte
                 FROM adocoes a INNER JOIN animais an ON an.id = a.animal_id
                 WHERE a.adotante_id = ? ORDER BY a.data_solicitacao DESC`;
    conexao.query(sql, [usuarioId], (erro, resultados) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao buscar histórico.', erro: erro.message });
        res.json({ usuario_id: usuarioId, quantidade: resultados.length, adocoes: resultados });
    });
});

// POST /adocao - registrar solicitação
router.post('/', (req, res) => {
    const adotanteId = Number(req.body.adotante_id ?? req.body.usuario_id);
    const animalId = Number(req.body.animal_id ?? req.body.pet_id);
    if (!Number.isInteger(adotanteId) || adotanteId < 1 || !Number.isInteger(animalId) || animalId < 1) {
        return res.status(400).json({ mensagem: 'Informe adotante_id e animal_id válidos.' });
    }
    conexao.query("SELECT id FROM usuarios WHERE id = ? AND perfil = 'adotante'", [adotanteId], (erro, usuarios) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao verificar adotante.', erro: erro.message });
        if (!usuarios.length) return res.status(400).json({ mensagem: 'Usuário não encontrado ou não tem perfil adotante.' });
        conexao.query("SELECT id FROM animais WHERE id = ? AND status = 'disponivel'", [animalId], (erroAnimal, animais) => {
            if (erroAnimal) return res.status(500).json({ mensagem: 'Erro ao verificar animal.', erro: erroAnimal.message });
            if (!animais.length) return res.status(409).json({ mensagem: 'Animal não encontrado ou não está disponível para adoção.' });
            const sql = `INSERT INTO adocoes (animal_id, adotante_id, status, data_solicitacao) VALUES (?, ?, 'solicitada', CURDATE())`;
            conexao.query(sql, [animalId, adotanteId], (erroInsert, resultado) => {
                if (erroInsert) return res.status(400).json({ mensagem: 'Erro ao registrar solicitação.', erro: erroInsert.message });
                res.status(201).json({ mensagem: 'Solicitação registrada.', adocao_id: resultado.insertId, adotante_id: adotanteId, animal_id: animalId, status: 'solicitada' });
            });
        });
    });
});

// PUT /adocao/:id - atualizar status
router.put('/:id', (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ mensagem: 'ID da adoção inválido.' });
    if (!statusPermitidos.includes(status)) return res.status(400).json({ mensagem: `Status inválido. Use: ${statusPermitidos.join(', ')}.` });
    const sql = `UPDATE adocoes SET status = ?, data_conclusao = CASE WHEN ? = 'concluida' THEN CURDATE() ELSE data_conclusao END WHERE id = ?`;
    conexao.query(sql, [status, status, id], (erro, resultado) => {
        if (erro) return res.status(400).json({ mensagem: 'Erro ao atualizar status.', erro: erro.message });
        if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Solicitação não encontrada.' });
        if (status === 'concluida') {
            conexao.query("UPDATE animais an INNER JOIN adocoes a ON a.animal_id = an.id SET an.status = 'adotado' WHERE a.id = ?", [id]);
        }
        res.json({ mensagem: 'Status atualizado.', adocao_id: id, status });
    });
});

// DELETE /adocao/:id - remover solicitação
router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ mensagem: 'ID da adoção inválido.' });
    conexao.query('DELETE FROM adocoes WHERE id = ?', [id], (erro, resultado) => {
        if (erro) return res.status(400).json({ mensagem: 'Erro ao remover solicitação.', erro: erro.message });
        if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Solicitação não encontrada.' });
        res.json({ mensagem: 'Solicitação removida.', adocao_id: id });
    });
});

module.exports = router;
