import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();  

async function removeUsers() {
  try {
    const users = await prisma.user.findMany();

    const usersToKeep = users.filter(user =>
      /luciana|paula garcia|tainá/i.test(user.name)
    );

    const usersToRemove = users.filter(
      user => !usersToKeep.some(u => u.id === user.id)
    );

    for (const user of usersToRemove) {
      await prisma.user.delete({
        where: { id: user.id },
      });
    }

  } catch (error) {
    console.error('Erro ao remover usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeUsers();
