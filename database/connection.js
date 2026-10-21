const mysql = require('mysql2');

const conexao = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'alexandre_2026',
    database: process.env.DB_NAME || 'plataforma_animais',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = conexao;
