import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateUserRoles() {
  try {
    const updatedUsers = await prisma.user.updateMany({
      data: {
        role: "LEADER",
      },
    });

    console.log(
      `${updatedUsers.count} usuários atualizados para o papel LEADERS.`
    );
  } catch (error) {
    console.error("Erro ao atualizar usuários:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRoles()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
