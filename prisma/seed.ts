import { PrismaClient, Role, PrayerTurnType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📌 Seeding database...");

  // Criando Regiões
  const regions = await prisma.region.createMany({
    data: [
      { name: "Brazil", code: "BR" },
      { name: "Europe", code: "EU" },
      { name: "North America", code: "NA" },
      { name: "Latin America", code: "LATAM" },
      { name: "Global", code: "GLOBAL" },
    ],
  });

  console.log("✅ Regions created!");

  // Obtendo as regiões para referência
  const regionList = await prisma.region.findMany();

  // Criando Igrejas (Churches)
  const churches = await prisma.church.createMany({
    data: [
      {
        name: "Igreja São Paulo",
        city: "São Paulo",
        country: "Brazil",
        regionId: regionList.find((r) => r.name === "Brazil")?.id,
        timezone: "America/Sao_Paulo",
      },
      {
        name: "Igreja Santos",
        city: "Santos",
        country: "Brazil",
        regionId: regionList.find((r) => r.name === "Brazil")?.id,
        timezone: "America/Sao_Paulo",
      },
      {
        name: "Igreja Campinas",
        city: "Campinas",
        country: "Brazil",
        regionId: regionList.find((r) => r.name === "Brazil")?.id,
        timezone: "America/Sao_Paulo",
      },
      {
        name: "Igreja Recife",
        city: "Recife",
        country: "Brazil",
        regionId: regionList.find((r) => r.name === "Brazil")?.id,
        timezone: "America/Recife",
      },
      {
        name: "Igreja Campo Grande",
        city: "Campo Grande",
        country: "Brazil",
        regionId: regionList.find((r) => r.name === "Brazil")?.id,
        timezone: "America/Campo_Grande",
      },
      {
        name: "Igreja Lisboa",
        city: "Lisboa",
        country: "Portugal",
        regionId: regionList.find((r) => r.name === "Europe")?.id,
        timezone: "Europe/Lisbon",
      },
      {
        name: "Igreja Porto",
        city: "Porto",
        country: "Portugal",
        regionId: regionList.find((r) => r.name === "Europe")?.id,
        timezone: "Europe/Lisbon",
      },
      {
        name: "Igreja Miami",
        city: "Miami",
        country: "USA",
        regionId: regionList.find((r) => r.name === "North America")?.id,
        timezone: "America/New_York",
      },
      {
        name: "Igreja Santiago",
        city: "Santiago",
        country: "Chile",
        regionId: regionList.find((r) => r.name === "Latin America")?.id,
        timezone: "America/Santiago",
      },
      {
        name: "Igreja Online Global",
        city: "Online",
        country: "World",
        regionId: regionList.find((r) => r.name === "Global")?.id,
        timezone: "UTC",
      },
    ],
  });

  console.log("✅ Churches created!");

  // Obtendo as igrejas para referência
  const churchList = await prisma.church.findMany();

  // Criando Usuários (Users)
  await prisma.user.createMany({
    data: [
      {
        name: "Admin User",
        whatsapp: "+5511999999999",
        email: "admin@example.com",
        role: Role.ADMIN,
        churchId: churchList.find((c) => c.name === "Igreja São Paulo")?.id,
      },
      {
        name: "Líder Recife",
        whatsapp: "+5581999999999",
        email: "leader@example.com",
        role: Role.USER,
        churchId: churchList.find((c) => c.name === "Igreja Recife")?.id,
      },
    ],
  });

  console.log("✅ Users created!");

  // Criando Eventos (Events)
  const events = await prisma.event.createMany({
    data: [
      {
        name: "40 Dias de Oração",
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-05-10"),
        description: "Um evento de 40 dias de oração contínua.",
        churchId: churchList.find((c) => c.name === "Igreja São Paulo")?.id,
      },
      {
        name: "Semana de Intercessão",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-06-07"),
        description: "Uma semana intensa de intercessão pela igreja.",
        churchId: churchList.find((c) => c.name === "Igreja Lisboa")?.id,
      },
    ],
  });

  console.log("✅ Events created!");

  // Obtendo os eventos para referência
  const eventList = await prisma.event.findMany();

  console.log("✅ Prayer Turns created!");

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
