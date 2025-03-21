import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkChurches() {
  try {
    const churches = await prisma.church.findMany();
    console.log(churches); // Aqui você verá as igrejas disponíveis no banco de dados
  } catch (error) {
    console.error("Erro ao consultar igrejas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChurches();
