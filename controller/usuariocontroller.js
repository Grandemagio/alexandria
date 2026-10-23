
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const conexao = require('../database/connection');

const router = express.Router();

// POST /usuarios/registro
router.post('/registro', async (req, res) => {
    const { nome, email, senha, telefone, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({
            mensagem: 'Preencha nome, email, senha e perfil.'
        });
    }

    // Cadastro público permite somente adotantes.
    if (perfil !== 'adotante') {
        return res.status(403).json({
            mensagem: 'O cadastro público permite apenas o perfil adotante.'
        });
    }

    if (
        typeof nome !== 'string' ||
        typeof email !== 'string' ||
        typeof senha !== 'string' ||
        (telefone != null && typeof telefone !== 'string')
    ) {
        return res.status(400).json({
            mensagem: 'Os dados enviados são inválidos.'
        });
    }

    if (senha.length < 8) {
        return res.status(400).json({
            mensagem: 'A senha deve ter pelo menos 8 caracteres.'
        });
    }

    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim().toLowerCase();

    if (!nomeNormalizado) {
        return res.status(400).json({
            mensagem: 'Informe um nome válido.'
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
        return res.status(400).json({
            mensagem: 'Informe um email válido.'
        });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO usuarios
                (nome, email, senha_hash, telefone, perfil)
            VALUES (?, ?, ?, ?, ?)
        `;

        conexao.query(
            sql,
            [
                nomeNormalizado,
                emailNormalizado,
                senhaHash,
                telefone ? telefone.trim() || null : null,
                'adotante'
            ],
            (erro, resultado) => {
                if (erro) {
                    if (erro.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({
                            mensagem: 'Este email já está cadastrado.'
                        });
                    }

                    console.error('Erro ao cadastrar usuário:', erro.message);

                    return res.status(500).json({
                        mensagem: 'Erro ao cadastrar usuário.'
                    });
                }

                return res.status(201).json({
                    mensagem: 'Usuário cadastrado com sucesso!',
                    usuario: {
                        id: resultado.insertId,
                        nome: nomeNormalizado,
                        email: emailNormalizado,
                        perfil: 'adotante'
                    }
                });
            }
        );
    } catch (erro) {
        console.error('Erro ao processar cadastro:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro ao processar o cadastro.'
        });
    }
});

// POST /usuarios/login
router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (
        typeof email !== 'string' ||
        typeof senha !== 'string' ||
        !email.trim() ||
        !senha
    ) {
        return res.status(400).json({
            mensagem: 'Informe email e senha.'
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET não está configurado.');

        return res.status(500).json({
            mensagem: 'Autenticação não está configurada no servidor.'
        });
    }

    const sql = `
        SELECT id, nome, email, senha_hash, perfil, ong_id
        FROM usuarios
        WHERE email = ?
        LIMIT 1
    `;

    conexao.query(
        sql,
        [email.trim().toLowerCase()],
        async (erro, resultados) => {
            if (erro) {
                console.error('Erro ao consultar usuário:', erro.message);

                return res.status(500).json({
                    mensagem: 'Erro ao consultar usuário.'
                });
            }

            if (!resultados.length) {
                return res.status(401).json({
                    mensagem: 'Email ou senha incorretos.'
                });
            }

            const usuario = resultados[0];

            try {
                const senhaCorreta = await bcrypt.compare(
                    senha,
                    usuario.senha_hash
                );

                if (!senhaCorreta) {
                    return res.status(401).json({
                        mensagem: 'Email ou senha incorretos.'
                    });
                }

                const token = jwt.sign(
                    {
                        id: usuario.id,
                        perfil: usuario.perfil
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '2h' }
                );

                return res.json({
                    mensagem: 'Login realizado com sucesso!',
                    token,
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        perfil: usuario.perfil,
                        ong_id: usuario.ong_id
                    }
                });
            } catch (erro) {
                console.error('Erro ao verificar senha:', erro.message);

                return res.status(500).json({
                    mensagem: 'Erro ao verificar senha.'
                });
            }
        }
    );
});

module.exports = router;
