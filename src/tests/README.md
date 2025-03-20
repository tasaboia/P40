# Testes do P40

Este diretório contém os testes automatizados para o projeto P40.

## Estrutura

```
tests/
  ├── unit/                           # Testes unitários
  │   ├── prayer-turn.test.ts         # Testes para validação de turnos de oração
  │   └── repositories/               # Testes de repositórios
  │       └── prayer-turn-repository.test.ts  # Testes do repositório de turnos
  └── README.md                       # Esta documentação
```

## Testes Unitários

### Validação de Turnos de Oração (`prayer-turn.test.ts`)

Testa os schemas de validação para:

- `CreatePrayerTurnDTO`: Validação dos dados para criar um novo turno

  - Formato válido dos dados
  - Validação do dia da semana (0-6)
  - Conversão de string para número no dia da semana
  - Validação do formato de hora

- `RemovePrayerTurnDTO`: Validação dos dados para remover um turno

  - Formato válido dos dados
  - Validação de IDs inválidos

- `PrayerTurn`: Validação do modelo completo de turno

  - Formato válido dos dados
  - Validação de duração
  - Validação de email do líder
  - Validação do formato de hora final
  - Validação de URL da imagem do líder

- `PrayerTurnStats`: Validação das estatísticas

  - Formato válido dos dados
  - Rejeição de números negativos
  - Validação do tamanho dos arrays de dias da semana

- `ChartData`: Validação dos dados do gráfico
  - Formato válido dos dados
  - Validação do dia (0-6)
  - Rejeição de valores negativos

### Repositório de Turnos de Oração (`prayer-turn-repository.test.ts`)

Testa a implementação do repositório usando Prisma:

- Operações básicas:

  - Criação de turno com usuário associado
  - Busca por ID com retorno de dados ou null
  - Busca por evento
  - Busca por dia da semana
  - Atualização de turno
  - Remoção de usuário do turno

- Operações específicas:
  - Busca de turnos por líder
  - Busca de turnos sobrepostos
  - Cálculo de estatísticas do evento

## Executando os Testes

```bash
# Executar todos os testes
yarn test

# Executar testes em modo watch
yarn test:watch

# Executar testes com cobertura
yarn test:coverage
```

## Cobertura de Código

A cobertura atual dos testes é:

- Statements: 93.33%
- Branches: 100%
- Functions: 100%
- Lines: 100%

## Dependências de Teste

- Jest: Framework de testes
- @testing-library/react: Utilitários para testar componentes React
- @testing-library/jest-dom: Matchers adicionais para Jest
- jest-mock-extended: Utilitários para mock de tipos TypeScript
