const express = require('express');
const router = express.Router();
const conexao = require('../database/connection');

// GET /pets - listar animais (por padrão, todos; use ?status=disponivel para filtrar)
router.get('/', (req, res) => {
    const { status } = req.query;
    const sql = `
        SELECT id, ong_id, nome, especie, raca, sexo, porte, data_nascimento,
               castrado, descricao, foto_url, status,
               espaco, energia, atencao, experiencia, criancas, outros_pets
        FROM animais
        ${status ? 'WHERE status = ?' : ''}
        ORDER BY id DESC
    `;
    const valores = status ? [status] : [];
    conexao.query(sql, valores, (erro, animais) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao listar animais.', erro: erro.message });
        res.json({ quantidade: animais.length, animais });
    });
});

// GET /pets/:id - buscar um animal
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ mensagem: 'ID inválido.' });
    conexao.query('SELECT * FROM animais WHERE id = ?', [id], (erro, resultados) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao buscar animal.', erro: erro.message });
        if (!resultados.length) return res.status(404).json({ mensagem: 'Animal não encontrado.' });
        res.json(resultados[0]);
    });
});

// POST /pets - cadastrar animal
router.post('/', (req, res) => {
    const { ong_id, nome, especie, raca, sexo, porte, data_nascimento, castrado, descricao, foto_url,
        status, espaco, energia, atencao, experiencia, criancas, outros_pets } = req.body;
    if (!ong_id || !especie) return res.status(400).json({ mensagem: 'Informe ong_id e especie.' });
    const sql = `INSERT INTO animais
        (ong_id, nome, especie, raca, sexo, porte, data_nascimento, castrado, descricao, foto_url, status,
         espaco, energia, atencao, experiencia, criancas, outros_pets)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [ong_id, nome || null, especie, raca || null, sexo || null, porte || null,
        data_nascimento || null, castrado ?? false, descricao || null, foto_url || null,
        status || 'resgatado', espaco || null, energia || null, atencao || null,
        experiencia || null, criancas ?? null, outros_pets ?? null];
    conexao.query(sql, values, (erro, resultado) => {
        if (erro) return res.status(400).json({ mensagem: 'Não foi possível cadastrar o animal. Confira os campos e o ong_id.', erro: erro.message });
        res.status(201).json({ mensagem: 'Animal cadastrado com sucesso.', id: resultado.insertId });
    });
});

// PUT /pets/:id - atualizar dados de um animal
router.put('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ mensagem: 'ID inválido.' });
    const allowed = ['ong_id','nome','especie','raca','sexo','porte','data_nascimento','castrado','descricao','foto_url','status','espaco','energia','atencao','experiencia','criancas','outros_pets'];
    const fields = allowed.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field));
    if (!fields.length) return res.status(400).json({ mensagem: 'Informe ao menos um campo para atualizar.' });
    const sql = `UPDATE animais SET ${fields.map((field) => `\`${field}\` = ?`).join(', ')} WHERE id = ?`;
    const values = fields.map((field) => req.body[field]);
    values.push(id);
    conexao.query(sql, values, (erro, resultado) => {
        if (erro) return res.status(400).json({ mensagem: 'Não foi possível atualizar o animal.', erro: erro.message });
        if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Animal não encontrado.' });
        res.json({ mensagem: 'Animal atualizado com sucesso.' });
    });
});

module.exports = router;
