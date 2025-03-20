# CI/CD Pipeline do Projeto P40

Este diretório contém a configuração de CI/CD (Integração Contínua/Entrega Contínua) para o projeto P40.

## Workflows

### 1. CI (Integração Contínua)

**Arquivo:** `.github/workflows/ci.yml`

Este workflow é executado em cada push para as branches `main` e `development`, e em pull requests para estas branches:

- **Testes**: Executa testes unitários e de integração usando Jest.
- **Linting**: Verifica a qualidade do código com ESLint.
- **Build**: Garante que o projeto compila sem erros.

### 2. Deploy para Produção

**Arquivo:** `.github/workflows/deploy.yml`

Este workflow é executado quando há um push para a branch `main`:

- Build do projeto
- Execução de migrações do banco de dados
- Deploy para o ambiente de produção (Vercel)
- Notificação após o deploy bem-sucedido

### 3. Deploy para Staging

**Arquivo:** `.github/workflows/deploy-staging.yml`

Este workflow é executado quando há um push para a branch `development`:

- Build do projeto
- Execução de migrações do banco de dados de staging
- Deploy para o ambiente de staging (Vercel)
- Execução de testes de smoke

### 4. Verificação de Qualidade de Código

**Arquivo:** `.github/workflows/code-quality.yml`

Este workflow verifica a qualidade do código:

- Verificação de tipos TypeScript
- Análise com SonarCloud
- Verificação de dependências desatualizadas ou com vulnerabilidades
- Análise de complexidade do código
- Detecção de código duplicado

## Segredos Necessários

Para que os workflows funcionem corretamente, os seguintes segredos devem ser configurados no GitHub:

- `DATABASE_URL`: URL de conexão com o banco de dados de produção
- `STAGING_DATABASE_URL`: URL de conexão com o banco de dados de staging
- `VERCEL_TOKEN`: Token de API do Vercel
- `VERCEL_ORG_ID`: ID da organização no Vercel
- `VERCEL_PROJECT_ID`: ID do projeto no Vercel
- `SONAR_TOKEN`: Token de API do SonarCloud

## Fluxo de Trabalho Recomendado

1. Desenvolvimento em branches de feature
2. Pull request para a branch `development`
3. Testes e verificação de qualidade automáticos
4. Merge em `development` -> deploy automático para staging
5. Pull request de `development` para `main` após testes em staging
6. Merge em `main` -> deploy automático para produção

## Configuração Local

Para executar os checks de CI localmente antes de fazer push:

```bash
# Executar testes
yarn test

# Verificar linting
yarn lint

# Verificar o build
yarn build
```
