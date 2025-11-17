# Configuração do Banco de Dados

## Script SQL para MariaDB/MySQL

Execute o arquivo `database.sql` no seu banco MariaDB no Railway:

```sql
-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS railway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco
USE railway;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  is_master TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_active (active),
  INDEX idx_is_master (is_master)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no Railway ou no arquivo `.env.local`:

```env
# Variáveis do Banco de Dados MySQL/MariaDB
DB_HOST=seu_host_railway
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=railway

# Ou use as variáveis padrão do Railway (se disponíveis)
# MYSQL_HOST=
# MYSQL_PORT=
# MYSQL_USER=
# MYSQL_PASSWORD=
# MYSQL_DATABASE=railway

# Usuário Master (criado automaticamente no primeiro acesso)
MASTER_SEED_EMAIL=admin@example.com
MASTER_SEED_PASSWORD=senha_segura_aqui
MASTER_SEED_ACTIVE=true

# Google Maps API (para busca de negócios)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
```

## Instalação

1. Execute `npm install` para instalar as dependências (incluindo `mysql2`)
2. Configure as variáveis de ambiente
3. Execute o script SQL no banco de dados
4. Execute `npm run dev` para iniciar o servidor

O usuário master será criado automaticamente no primeiro acesso à API de login.

