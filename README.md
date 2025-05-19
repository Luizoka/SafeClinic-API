# SafeClinic API

API para o sistema SafeClinic de agendamento de consultas médicas.

## Descrição

O SafeClinic é uma aplicação web para otimizar o agendamento de consultas médicas, com funcionalidades para pacientes, médicos e administradores. Oferece:

- Interface intuitiva para agendamento e acompanhamento de consultas
- Painel administrativo para gestão de horários, cadastro de pacientes e registros clínicos
- Mecanismos de segurança robustos (HTTPS, criptografia, autenticação multifator)

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- PostgreSQL
- TypeORM
- JWT para autenticação
- Swagger para documentação da API
- Joi para validação de dados
- Winston para logs

## Funcionalidades Principais

- Autenticação e autorização com JWT
- Gerenciamento de pacientes, médicos e recepcionistas
- Agendamento de consultas
- Gerenciamento de horários de atendimento
- Sistema de notificações
- Controle de acesso baseado em papéis (RBAC)
- Logs de auditoria
- Documentação interativa da API

## Requisitos

- Node.js 14+
- PostgreSQL 12+
- Yarn ou NPM

## Instalação

1. Clone o repositório:
```
git clone https://github.com/seu-usuario/safeclinic-api.git
cd safeclinic-api
```

2. Instale as dependências:
```
npm install
```

3. Configure as variáveis de ambiente:
```
cp .env.example .env
```
Edite o arquivo `.env` com as configurações do seu ambiente.

4. Configure o banco de dados:
```
psql -U postgres -c "CREATE DATABASE safeclinic"
```

5. Execute as migrações do banco de dados:
```
npm run migration:run
```

6. Inicie o servidor de desenvolvimento:
```
npm run dev
```

## Estrutura do Projeto

```
safeclinic-api/
├── src/
│   ├── config/        # Configurações da aplicação
│   ├── controllers/   # Controladores da API
│   ├── database/      # Configurações e migrações do banco de dados
│   ├── middlewares/   # Middlewares do Express
│   ├── models/        # Modelos de dados (entidades TypeORM)
│   ├── routes/        # Rotas da API
│   ├── services/      # Serviços de negócio
│   ├── utils/         # Utilitários e helpers
│   ├── server.ts      # Ponto de entrada da aplicação
├── database/          # Scripts SQL
├── logs/              # Logs da aplicação
├── .env.example       # Exemplo de variáveis de ambiente
├── package.json       # Dependências e scripts
├── tsconfig.json      # Configuração do TypeScript
└── README.md          # Documentação
```

## Rotas da API

O acesso completo à documentação da API está disponível em `/api-docs` quando o servidor está em execução.

Principais endpoints:

- **Autenticação**
  - `POST /api/v1/auth/login`: Login de usuário
  - `POST /api/v1/auth/refresh-token`: Renovar token JWT

- **Pacientes**
  - `GET /api/v1/patients`: Listar pacientes
  - `GET /api/v1/patients/:id`: Obter detalhes de paciente
  - `POST /api/v1/patients`: Criar paciente
  - `PUT /api/v1/patients/:id`: Atualizar paciente
  - `DELETE /api/v1/patients/:id`: Desativar paciente

- **Médicos**
  - `GET /api/v1/doctors`: Listar médicos
  - `GET /api/v1/doctors/speciality/:speciality`: Listar médicos por especialidade
  - `GET /api/v1/doctors/:id`: Obter detalhes de médico
  - `POST /api/v1/doctors`: Criar médico
  - `PUT /api/v1/doctors/:id`: Atualizar médico
  - `DELETE /api/v1/doctors/:id`: Desativar médico

## Segurança

- Todas as senhas são armazenadas com hash usando bcrypt
- Autenticação baseada em JWT
- Controle de acesso baseado em papéis
- Rate limiting para prevenção de ataques de força bruta
- Logs de auditoria para ações críticas
- HTTPS para comunicação segura
- Proteção contra ataques comuns (XSS, CSRF, Injection)

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Luiz Lopes - luizgalopes01@gmail.com
Sandra Remédios - Srocha2290@gmail.com 
