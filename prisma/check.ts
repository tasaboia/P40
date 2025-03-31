import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const expectedTurns = Array.from({ length: 24 }, (_, i) => {
  const hourStart = `${String(i).padStart(2, "0")}:00`;
  const hourEnd = `${String((i + 1) % 24).padStart(2, "0")}:00`;
  return { startTime: hourStart, endTime: hourEnd };
});

async function checkEventTurns() {
  const events = await prisma.event.findMany({
    include: { prayerTurns: true, church: true },
  });

  const report = [];

  for (const event of events) {
    const missingTurns = [];

    for (const turn of expectedTurns) {
      const exists = event.prayerTurns.some(
        (pt) => pt.startTime === turn.startTime && pt.endTime === turn.endTime
      );
      if (!exists) {
        missingTurns.push(`${turn.startTime} - ${turn.endTime}`);
      }
    }

    report.push({
      church: event.church.name,
      event: event.name,
      missingTurns,
      totalTurnsCreated: event.prayerTurns.length,
      expectedTurns: expectedTurns.length,
      isComplete: missingTurns.length === 0,
    });
  }

  console.log("\n🔍 Relatório Detalhado de Turnos por Evento e Igreja 🔍");

  report.forEach((item, index) => {
    console.log(`\n[${index + 1}] Igreja: ${item.church}`);
    console.log(`Evento: ${item.event}`);
    console.log(`Turnos criados: ${item.totalTurnsCreated}/${item.expectedTurns}`);

    if (item.isComplete) {
      console.log("✅ Todos os turnos estão completos.");
    } else {
      console.log("⚠️ Turnos faltando:");
      item.missingTurns.forEach((turn) => console.log(`  - ${turn}`));
    }
    console.log("----------------------------------------");
  });
}

checkEventTurns()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
