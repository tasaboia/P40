
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();  

const AreasOfService = [
  "Intercessão",
  "Altomonte",
  "MInistração",
  "G5.2",
  "Ohana",
  "Raízes",
  "Jornada",
  "PUL",
  "Missões",
  "Rise",
  "Flow",
  "Vox",
  "Eklektos",
  "Diamantes",
  "Pastor/Presbitério",
  "link"
];

async function seedServiceAreas() {
  try {
    for (const area of AreasOfService) {
      await prisma.serviceArea.upsert({
        where: { name: area },
        update: {},
        create: { name: area },
      });
      console.log(`Área criada/inserida: ${area}`);
    }

    console.log("Seed das áreas de serviço concluído com sucesso!");
  } catch (error) {
    console.error("Erro ao inserir áreas de serviço:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedServiceAreas();
