import { PrismaClient, PrayerTurnType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📌 Criando novas igrejas...");

  const regionList = await prisma.region.findMany();

  await prisma.church.createMany({
    data: [
      {
        name: "Zion Ribeirão Preto",
        city: "Ribeirão Preto",
        country: "Brazil",
        regionId: regionList.find((r) => r.name === "Brazil")?.id,
        timezone: "America/Sao_Paulo",
      },
      {
        name: "Zion Vale do Ribeira",
        city: "Vale do Ribeira",
        country: "Brazil",
        regionId: regionList.find((r) => r.name === "Brazil")?.id,
        timezone: "America/Sao_Paulo",
      },
      {
        name: "Zion Maceió",
        city: "Maceió",
        country: "Brazil",
        regionId: regionList.find((r) => r.name === "Brazil")?.id,
        timezone: "America/Maceio",
      },
      {
        name: "Zion Quito",
        city: "Quito",
        country: "Ecuador",
        regionId: regionList.find((r) => r.name === "Latin America")?.id,
        timezone: "America/Guayaquil",
      }
    ]
  });

  console.log("✅ Novas igrejas criadas!");

  // Obtendo as igrejas recém-criadas
  const churchList = await prisma.church.findMany({
    where: {
      name: {
        in: [
          "Zion Ribeirão Preto",
          "Zion Vale do Ribeira",
          "Zion Maceió",
          "Zion Quito"
        ]
      }
    }
  });

  // Criando eventos para cada igreja
  for (const church of churchList) {
    const event = await prisma.event.create({
      data: {
        name: "40 Dias de Oração",
        startDate: new Date("2025-04-12"),
        endDate: new Date("2025-05-21T22:00:00"), // Corrigido para terminar às 22:00
        description: "Um evento de 40 dias de oração contínua.",
        churchId: church.id,
        type: PrayerTurnType.SHIFT,
        maxParticipantsPerTurn: 2,
        shiftDuration: 60
      }
    });

    // Criando turnos de oração para o evento
    // 24 turnos por dia (00:00 - 23:00)
    // 7 dias por semana
    // Total: 168 turnos
    const prayerTurns = [];
    
    // Para cada dia da semana (1 = Segunda, 6 = sabado, 0 = Domingo)
    for (let weekday = 0; weekday <= 6; weekday++) {
      // Para cada hora do dia (00:00 até 23:00)
      for (let hour = 0; hour < 24; hour++) {
        const startHour = hour.toString().padStart(2, '0');
        const endHour = (hour + 1).toString().padStart(2, '0');
        
        prayerTurns.push({
          eventId: event.id,
          type: PrayerTurnType.SHIFT,
          startTime: `${startHour}:00`,
          endTime: `${endHour}:00`,
          duration: 60,
          allowChangeAfterStart: true,
          weekday: weekday
        });
      }
    }


    // Criando todos os turnos de uma vez
    await prisma.prayerTurn.createMany({
      data: prayerTurns
    });
  }

  console.log("✅ Eventos e turnos criados!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });