# Variáveis de Ambiente para Produção (Railway)

Configure estas variáveis de ambiente no painel do Railway para o serviço **"Capta-o-de-clientes"**:

## Como Configurar no Railway:

1. Acesse o painel do Railway
2. Selecione o serviço **"Capta-o-de-clientes"**
3. Vá na aba **"Variáveis"** (Variables)
4. Adicione cada variável abaixo:

---

## Variáveis do Banco de Dados MySQL

```
DB_HOST=centerbeam.proxy.rlwy.net
DB_PORT=26116
DB_USER=root
DB_PASSWORD=rYvfIZXgywkeHDlVvZnWRaEQCLkIrJJB
DB_NAME=railway
```

---

## Variáveis do Usuário Master

```
MASTER_SEED_EMAIL=orbite@orbite.com.br
MASTER_SEED_PASSWORD=D@viS@ntos1982
MASTER_SEED_ACTIVE=true
```

---

## Variáveis do Google Maps API

**IMPORTANTE:** Você precisa de uma chave de API do Google Maps. Configure as restrições HTTP para permitir:

- `capta-o-de-clientes-production.up.railway.app`
- `*.up.railway.app` (opcional, para cobrir todos os subdomínios)

Depois, adicione as variáveis:

```
GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
```

**Nota:** Use a mesma chave para ambas as variáveis, mas certifique-se de que as restrições HTTP no Google Cloud Console permitam o domínio do Railway.

---

## Resumo das Variáveis

Copie e cole todas as variáveis abaixo no Railway:

```
DB_HOST=centerbeam.proxy.rlwy.net
DB_PORT=26116
DB_USER=root
DB_PASSWORD=rYvfIZXgywkeHDlVvZnWRaEQCLkIrJJB
DB_NAME=railway
MASTER_SEED_EMAIL=orbite@orbite.com.br
MASTER_SEED_PASSWORD=D@viS@ntos1982
MASTER_SEED_ACTIVE=true
GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
```

---

## Após Configurar:

1. O Railway irá fazer um novo deploy automaticamente
2. Aguarde o deploy completar
3. Teste o site em: `https://capta-o-de-clientes-production.up.railway.app`

