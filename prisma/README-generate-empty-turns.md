# Script para Geração de Turnos Vazios

Este script gera turnos de oração vazios para todos os eventos ativos de todas as igrejas no sistema. Ele foi projetado para preencher os "espaços vazios" em eventos de oração, criando registros para todos os horários possíveis dentro do período do evento.

## Funcionalidades

- Identifica todas as igrejas cadastradas no sistema
- Para cada igreja, identifica todos os eventos ativos
- Para cada evento, cria turnos vazios para todos os horários disponíveis
- Evita duplicação ao verificar turnos já existentes
- Respeita turnos que já possuem líderes atribuídos

## Como Usar

1. **Adapte o script ao seu modelo de dados**: Antes de executar, você precisa verificar e ajustar o script conforme a estrutura do seu banco de dados.

2. **Instale as dependências**:

   ```bash
   yarn add date-fns
   ```

3. **Execute o script**:
   ```bash
   npx ts-node prisma/generate-empty-turns.ts
   ```

## Personalizações Necessárias

Você deve editar o script `generate-empty-turns.ts` para ajustá-lo ao seu esquema de banco de dados. Especificamente:

1. **Condição de evento ativo**: Verifique como os eventos ativos são representados no seu esquema e ajuste a condição:

   ```typescript
   // Se o campo 'active' é um booleano:
   active: true,

   // OU se o status é representado de outra forma:
   status: "ACTIVE",
   ```

2. **Estrutura de criação de turno**: Verifique os campos obrigatórios do modelo `PrayerTurn` e ajuste:

   ```typescript
   await prisma.prayerTurn.create({
     data: {
       // Verifique o relacionamento correto com o evento:
       eventId: event.id,
       // OU usando connect:
       // event: { connect: { id: event.id } },

       weekday,
       startTime: timeSlot,
       endTime: calculateEndTime(timeSlot, 2),

       // Outros campos obrigatórios do seu modelo:
       // type: o valor correto conforme seu enum,
       // Exemplos: "PRAYER", "WORSHIP", "STANDARD", etc.
     },
   });
   ```

3. **Intervalos de horários**: Ajuste a lista de `timeSlots` conforme necessário para sua organização:
   ```typescript
   const timeSlots = [
     "00:00",
     "02:00",
     "04:00",
     "06:00",
     "08:00",
     "10:00",
     "12:00",
     "14:00",
     "16:00",
     "18:00",
     "20:00",
     "22:00",
   ];
   ```

## Exemplo de Log de Execução

```
Iniciando geração de turnos vazios...
Encontradas 5 igrejas
Processando igreja: Igreja Exemplo (id1)
Encontrados 2 eventos para esta igreja
Processando evento: 40 Dias de Oração (event1)
Duração do evento: 40 dias
Turnos existentes para este evento: 156
Evento 40 Dias de Oração: 324 turnos criados, 156 turnos ignorados (já existentes)
...
Geração de turnos vazios concluída com sucesso!
```

## Resolução de Problemas

Se você encontrar erros como:

- `Object literal may only specify known properties, and 'active' does not exist in type 'EventWhereInput'`: Verifique seu esquema Prisma para entender como eventos ativos são representados.

- `Type '"REGULAR"' is not assignable to type 'PrayerTurnType'`: Verifique o enum `PrayerTurnType` em seu esquema Prisma para usar o valor correto.

Para visualizar seu esquema atual, você pode executar:

```bash
npx prisma generate --schema=./prisma/schema.prisma
```
