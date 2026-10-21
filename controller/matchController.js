const express = require('express');
const router = express.Router();
const conexao = require('../database/connection');

function calcularMatch(adotante, animal) {
    let pontos = 0;
    const motivos = [];
    if (adotante.espaco && animal.espaco && adotante.espaco === animal.espaco) { pontos += 25; motivos.push('Espaço compatível'); }
    if (adotante.atividade && animal.energia && adotante.atividade === animal.energia) { pontos += 20; motivos.push('Nível de atividade compatível'); }
    if (adotante.tempo && animal.atencao && ((adotante.tempo === 'muito' && animal.atencao === 'muita') || (adotante.tempo === 'pouco' && animal.atencao === 'pouca'))) { pontos += 20; motivos.push('Tempo disponível compatível'); }
    if (adotante.experiencia && animal.experiencia && adotante.experiencia === animal.experiencia) { pontos += 15; motivos.push('Experiência compatível'); }
    if (animal.criancas !== null && animal.criancas !== undefined && Boolean(adotante.criancas) === Boolean(animal.criancas)) { pontos += 10; motivos.push('Compatibilidade com crianças'); }
    if (animal.outros_pets !== null && animal.outros_pets !== undefined && Boolean(adotante.outros_pets) === Boolean(animal.outros_pets)) { pontos += 10; motivos.push('Compatibilidade com outros animais'); }
    return { pontos, motivos };
}

// GET /match/adotante/:usuario_id
router.get('/adotante/:usuario_id', (req, res) => {
    const usuarioId = Number(req.params.usuario_id);
    if (!Number.isInteger(usuarioId) || usuarioId < 1) return res.status(400).json({ mensagem: 'ID inválido.' });
    const sqlPerfil = `SELECT usuario_id, espaco, atividade, tempo, experiencia, criancas, outros_pets FROM perfis_adotantes WHERE usuario_id = ?`;
    conexao.query(sqlPerfil, [usuarioId], (erro, perfis) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao consultar perfil.', erro: erro.message });
        if (!perfis.length) return res.status(404).json({ mensagem: 'Perfil do adotante não encontrado.' });
        const adotante = perfis[0];
        const sqlAnimais = `SELECT id, nome, especie, raca, porte, foto_url, espaco, energia, atencao, experiencia, criancas, outros_pets FROM animais WHERE status = 'disponivel'`;
        conexao.query(sqlAnimais, (erroAnimais, animais) => {
            if (erroAnimais) return res.status(500).json({ mensagem: 'Erro ao consultar animais.', erro: erroAnimais.message });
            const resultados = animais.map((animal) => {
                const resultado = calcularMatch(adotante, animal);
                return { id: animal.id, nome: animal.nome, especie: animal.especie, raca: animal.raca, porte: animal.porte, foto_url: animal.foto_url, compatibilidade: resultado.pontos, motivos: resultado.motivos };
            }).sort((a, b) => b.compatibilidade - a.compatibilidade);
            res.json({ adotante, quantidade: resultados.length, animais: resultados });
        });
    });
});

module.exports = router;
