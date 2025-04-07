import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Verifica se a área já existe
    const existingArea = await prisma.serviceArea.findFirst({
      where: {
        name: "Áreas Executivas",
      },
    });

    if (!existingArea) {
      // Cria a nova área de serviço
      const newArea = await prisma.serviceArea.create({
        data: {
          name: "Áreas Executivas",
        },
      });

      console.log("Nova área de serviço criada:", newArea);
    } else {
      console.log("Área de serviço já existe:", existingArea);
    }
  } catch (error) {
    console.error("Erro ao criar área de serviço:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 