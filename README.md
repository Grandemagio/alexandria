# PetMatch API

API Node.js, Express e MySQL para adoção de animais.

## 1. Preparar o banco

1. Abra MySQL Workbench ou outro cliente MySQL.
2. Execute `banco_completo-adaptado.sql`. Ele usa o backup `banco_completo.sql` como base e acrescenta `perfis_adotantes` e os campos de compatibilidade esperados pelos controllers.
3. O script é para uma instalação limpa: execute apenas se o banco `plataforma_animais` ainda não existir. Se já existir, faça backup e confira antes de executar.

## 2. Configurar a API

```bash
npm install
```

Copie `.env.example` para `.env` e ajuste `DB_USER` e `DB_PASSWORD` de acordo com seu MySQL. O `DB_NAME` deve ser `plataforma_animais`.

```bash
npm start
```

Para desenvolvimento com reinício automático (Node 24 ou versão compatível):

```bash
npm run dev
```

A API fica em `http://localhost:3000`.

## Rotas

- `GET /` — verifica se a API iniciou.
- `GET /health` — verifica conexão com o MySQL.
- `GET /pets` — lista animais; opcional `GET /pets?status=disponivel`.
- `GET /pets/:id` — consulta um animal.
- `POST /pets` — cadastra animal (requer `ong_id` e `especie`, além dos campos desejados).
- `PUT /pets/:id` — atualiza campos do animal.
- `POST /adotantes` — cria perfil de compatibilidade para um usuário existente com perfil `adotante`.
- `GET /adotantes/:usuario_id` — consulta o perfil.
- `PUT /adotantes/:usuario_id` — atualiza o perfil.
- `GET /match/adotante/:usuario_id` — calcula compatibilidade com animais disponíveis.
- `GET /adocao` — lista solicitações de adoção.
- `GET /adocao/adotante/:usuario_id` — histórico de adoções.
- `POST /adocao` — registra solicitação (`adotante_id` e `animal_id`; também aceita os nomes antigos `usuario_id` e `pet_id`).
- `PUT /adocao/:id` — atualiza status (`solicitada`, `em_analise`, `aprovada`, `recusada`, `concluida`).
- `DELETE /adocao/:id` — remove solicitação.

## Observações

- O cadastro de usuário e autenticação ainda não fazem parte desta API; os IDs de usuários do SQL de exemplo são usados nos testes.
- As rotas ainda não possuem autenticação/autorização. Antes de publicar na internet, adicione login, autorização por perfil, validação mais rigorosa e proteções adequadas.
- As notas de compatibilidade (`espaco`, `energia` etc.) são dados aproximados de exemplo, não uma avaliação veterinária/comportamental.
