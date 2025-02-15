import { PrismaClient, Region } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📌 Seeding database...");

  const utcMinus3 = await prisma.timeZone.upsert({
    where: { name: "America/Sao_Paulo" },
    update: {},
    create: { name: "America/Sao_Paulo", offset: "UTC-3" },
  });

  const utcMinus5 = await prisma.timeZone.upsert({
    where: { name: "America/New_York" },
    update: {},
    create: { name: "America/New_York", offset: "UTC-5" },
  });

  const utc0 = await prisma.timeZone.upsert({
    where: { name: "Europe/Lisbon" },
    update: {},
    create: { name: "Europe/Lisbon", offset: "UTC+0" },
  });

  // Create Zions
  const zions = await prisma.zion.createMany({
    data: [
      {
        name: "São Paulo",
        city: "São Paulo",
        country: "Brazil",
        region: Region.BRAZIL,
        timeZoneId: utcMinus3.id,
      },
      {
        name: "Santos",
        city: "Santos",
        country: "Brazil",
        region: Region.BRAZIL,
        timeZoneId: utcMinus3.id,
      },
      {
        name: "Campinas",
        city: "Campinas",
        country: "Brazil",
        region: Region.BRAZIL,
        timeZoneId: utcMinus3.id,
      },
      {
        name: "Recife",
        city: "Recife",
        country: "Brazil",
        region: Region.BRAZIL,
        timeZoneId: utcMinus3.id,
      },
      {
        name: "Campo Grande",
        city: "Campo Grande",
        country: "Brazil",
        region: Region.BRAZIL,
        timeZoneId: utcMinus3.id,
      },
      {
        name: "Lisboa",
        city: "Lisboa",
        country: "Portugal",
        region: Region.EUROPE,
        timeZoneId: utc0.id,
      },
      {
        name: "Porto",
        city: "Porto",
        country: "Portugal",
        region: Region.EUROPE,
        timeZoneId: utc0.id,
      },
      {
        name: "Miami",
        city: "Miami",
        country: "USA",
        region: Region.NORTH_AMERICA,
        timeZoneId: utcMinus5.id,
      },
      {
        name: "Santiago",
        city: "Santiago",
        country: "Chile",
        region: Region.LATIN_AMERICA,
        timeZoneId: utcMinus3.id,
      },
      {
        name: "Online Global",
        city: "Online",
        country: "World",
        region: Region.GLOBAL,
        timeZoneId: utc0.id,
      },
    ],
  });

  console.log("✅ Zions created!");

  // Get Zions to associate languages
  const zionList = await prisma.zion.findMany();

  // Create Languages
  await prisma.language.createMany({
    data: [
      { code: "en", label: "English", region: Region.GLOBAL, zionId: null },
      {
        code: "pt",
        label: "Português",
        region: Region.BRAZIL,
        zionId: zionList.find((z) => z.name === "São Paulo")?.id,
      },
      {
        code: "es",
        label: "Español",
        region: Region.LATIN_AMERICA,
        zionId: zionList.find((z) => z.name === "Santiago")?.id,
      },
      {
        code: "fr",
        label: "Français",
        region: Region.EUROPE,
        zionId: zionList.find((z) => z.name === "Lisboa")?.id,
      },
    ],
  });

  console.log("✅ Languages created!");

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
