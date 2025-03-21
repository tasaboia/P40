import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateUser() {
  try {
    const user = await prisma.user.update({
      where: {
        id: "52ffe218-897c-4f15-bf8f-0adb33072cc3",
      },
      data: {
        role: "ADMIN",
      },
    });
    console.log(user);
  } catch (error) {
    console.error("Erro ao consultar igrejas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUser();
