-- Plataforma de Adoção e Apadrinhamento de Animais (ONGs) - Estrutura + dados de exemplo (MySQL)
-- Estrutura do banco - MySQL

CREATE DATABASE IF NOT EXISTS plataforma_animais
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE plataforma_animais;

CREATE TABLE ongs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(120),
  telefone VARCHAR(20),
  cidade VARCHAR(80),
  uf CHAR(2)
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ong_id INT NULL,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  perfil ENUM('admin','voluntario','adotante','padrinho','doador') NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ong_id) REFERENCES ongs(id)
);

CREATE TABLE perfis_adotantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  espaco ENUM('apartamento','casa_pequena','casa_grande') NOT NULL,
  atividade ENUM('baixa','media','alta') NOT NULL,
  tempo ENUM('pouco','medio','muito') NOT NULL,
  experiencia ENUM('iniciante','intermediario','experiente') NOT NULL,
  criancas BOOLEAN NOT NULL DEFAULT FALSE,
  outros_pets BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE animais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ong_id INT NOT NULL,
  nome VARCHAR(80),
  especie ENUM('cao','gato','outro') NOT NULL,
  raca VARCHAR(60),
  sexo ENUM('M','F'),
  porte ENUM('pequeno','medio','grande'),
  data_nascimento DATE,
  castrado BOOLEAN DEFAULT FALSE,
  descricao TEXT,
  foto_url VARCHAR(255),
  status ENUM('resgatado','disponivel','adotado','em_tratamento','lar_temporario') DEFAULT 'resgatado',
  espaco ENUM('apartamento','casa_pequena','casa_grande') DEFAULT 'casa_pequena',
  energia ENUM('baixa','media','alta') DEFAULT 'media',
  atencao ENUM('pouca','media','muita') DEFAULT 'media',
  experiencia ENUM('iniciante','intermediario','experiente') DEFAULT 'iniciante',
  criancas BOOLEAN DEFAULT FALSE,
  outros_pets BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (ong_id) REFERENCES ongs(id)
);

CREATE TABLE resgates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  responsavel_id INT,
  data_resgate DATE NOT NULL,
  local_resgate VARCHAR(200),
  situacao TEXT,
  FOREIGN KEY (animal_id) REFERENCES animais(id),
  FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);

CREATE TABLE adocoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  adotante_id INT NOT NULL,
  status ENUM('solicitada','em_analise','aprovada','recusada','concluida') DEFAULT 'solicitada',
  data_solicitacao DATE NOT NULL,
  data_conclusao DATE,
  observacoes TEXT,
  FOREIGN KEY (animal_id) REFERENCES animais(id),
  FOREIGN KEY (adotante_id) REFERENCES usuarios(id)
);

CREATE TABLE apadrinhamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  padrinho_id INT NOT NULL,
  valor_mensal DECIMAL(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status ENUM('ativo','pausado','encerrado') DEFAULT 'ativo',
  FOREIGN KEY (animal_id) REFERENCES animais(id),
  FOREIGN KEY (padrinho_id) REFERENCES usuarios(id)
);

CREATE TABLE eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ong_id INT NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  data_evento DATETIME NOT NULL,
  local_evento VARCHAR(200),
  FOREIGN KEY (ong_id) REFERENCES ongs(id)
);

CREATE TABLE evento_animais (
  evento_id INT NOT NULL,
  animal_id INT NOT NULL,
  PRIMARY KEY (evento_id, animal_id),
  FOREIGN KEY (evento_id) REFERENCES eventos(id),
  FOREIGN KEY (animal_id) REFERENCES animais(id)
);

CREATE TABLE doacoes_financeiras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ong_id INT NOT NULL,
  doador_id INT,
  animal_id INT NULL,
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento ENUM('pix','cartao','boleto') NOT NULL,
  status ENUM('pendente','confirmada','cancelada') DEFAULT 'pendente',
  data_doacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ong_id) REFERENCES ongs(id),
  FOREIGN KEY (doador_id) REFERENCES usuarios(id),
  FOREIGN KEY (animal_id) REFERENCES animais(id)
);

CREATE TABLE insumos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ong_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  estoque DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (ong_id) REFERENCES ongs(id)
);

CREATE TABLE doacoes_insumos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  insumo_id INT NOT NULL,
  doador_id INT,
  quantidade DECIMAL(10,2) NOT NULL,
  data_doacao DATE NOT NULL,
  FOREIGN KEY (insumo_id) REFERENCES insumos(id),
  FOREIGN KEY (doador_id) REFERENCES usuarios(id)
);


INSERT INTO ongs (nome, cnpj, email, telefone, cidade, uf) VALUES
('Patas Amigas', '12.345.678/0001-90', 'contato@patasamigas.org', '(11) 99999-0001', 'São Paulo', 'SP');

INSERT INTO usuarios (ong_id, nome, email, senha_hash, telefone, perfil) VALUES
(1, 'Marina Souza',   'marina@patasamigas.org', 'hash_exemplo_1', '(11) 98888-0001', 'admin'),
(1, 'Carlos Lima',    'carlos@patasamigas.org', 'hash_exemplo_2', '(11) 98888-0002', 'voluntario'),
(NULL, 'Ana Pereira',   'ana@email.com',  'hash_exemplo_3', '(11) 97777-0003', 'adotante'),
(NULL, 'João Ribeiro',  'joao@email.com', 'hash_exemplo_4', '(11) 97777-0004', 'padrinho'),
(NULL, 'Beatriz Nunes', 'bia@email.com',  'hash_exemplo_5', '(11) 97777-0005', 'doador');

INSERT INTO perfis_adotantes (usuario_id, espaco, atividade, tempo, experiencia, criancas, outros_pets) VALUES
(3, 'apartamento', 'baixa', 'muito', 'iniciante', TRUE, TRUE);

INSERT INTO animais (ong_id, nome, especie, raca, sexo, porte, data_nascimento, castrado, descricao, status, espaco, energia, atencao, experiencia, criancas, outros_pets) VALUES
(1, 'Thor', 'cao',  'SRD',    'M', 'medio',   '2022-03-10', TRUE,  'Dócil e brincalhão',           'disponivel', 'casa_grande', 'alta', 'muita', 'experiente', TRUE, FALSE),
(1, 'Mel',  'gato', 'SRD',    'F', 'pequeno', '2023-06-01', TRUE,  'Tranquila, ótima com crianças', 'adotado', 'apartamento', 'baixa', 'pouca', 'iniciante', TRUE, TRUE),
(1, 'Bob',  'cao',  'Poodle', 'M', 'pequeno', '2019-11-20', FALSE, 'Idoso, precisa de cuidados',    'em_tratamento', 'casa_pequena', 'baixa', 'pouca', 'iniciante', FALSE, FALSE);

INSERT INTO resgates (animal_id, responsavel_id, data_resgate, local_resgate, situacao) VALUES
(1, 2, '2026-05-12', 'Av. Paulista, 1000', 'Encontrado abandonado, magro'),
(2, 2, '2026-06-03', 'Praça da Sé',        'Filhote encontrado em caixa'),
(3, 2, '2026-08-20', 'Rua Augusta, 500',   'Atropelado, com fratura na pata');

INSERT INTO adocoes (animal_id, adotante_id, status, data_solicitacao, data_conclusao, observacoes) VALUES
(2, 3, 'concluida',  '2026-07-01', '2026-07-15', 'Visita domiciliar aprovada'),
(1, 3, 'em_analise', '2026-09-25', NULL,         'Aguardando visita');

INSERT INTO apadrinhamentos (animal_id, padrinho_id, valor_mensal, data_inicio, status) VALUES
(3, 4, 50.00, '2026-09-01', 'ativo');

INSERT INTO eventos (ong_id, titulo, data_evento, local_evento) VALUES
(1, 'Feira de Adoção do Ibirapuera', '2026-10-18 10:00:00', 'Parque Ibirapuera - Portão 3');

INSERT INTO evento_animais (evento_id, animal_id) VALUES (1, 1);

INSERT INTO doacoes_financeiras (ong_id, doador_id, animal_id, valor, forma_pagamento, status) VALUES
(1, 5, NULL, 100.00, 'pix',    'confirmada'),
(1, 4, 3,     50.00, 'cartao', 'confirmada');

INSERT INTO insumos (ong_id, nome, unidade, estoque) VALUES
(1, 'Ração para cães adultos', 'kg', 40),
(1, 'Areia sanitária',         'kg', 25),
(1, 'Vermífugo',               'un', 15);

INSERT INTO doacoes_insumos (insumo_id, doador_id, quantidade, data_doacao) VALUES
(1, 5, 20, '2026-09-10'),
(2, 5, 10, '2026-09-10');
