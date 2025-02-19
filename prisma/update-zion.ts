import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateChurchNames() {
  try {
    const churches = await prisma.church.findMany({
      where: {
        name: {
          startsWith: "Igreja",
        },
      },
      select: {
        id: true,
        name: true,
        city: true,
      },
    });

    for (const church of churches) {
      const newName = church.name.replace(/^Igreja/, "Zion");

      await prisma.church.update({
        where: { id: church.id },
        data: { name: newName },
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar igrejas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateChurchNames()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
