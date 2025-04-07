import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateUsersToLeader() {
  try {
    console.log('\n=== ATUALIZANDO USUÁRIOS PARA LÍDERES ===\n');
    
    // Buscar usuários que são USER atualmente
    const users = await prisma.user.findMany({
      where: {
        role: "USER"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log(`Encontrados ${users.length} usuários com role "USER".`);
    
    // Atualizar role de USER para LEADER
    const updatedUsers = await prisma.user.updateMany({
      where: {
        role: "USER"
      },
      data: {
        role: "LEADER"
      }
    });

    console.log(`\n✅ ${updatedUsers.count} usuários atualizados de "USER" para "LEADER".`);
    
    // Verificar quantos usuários já são ADMIN (para referência)
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN"
      }
    });

    console.log(`\nUsuários com role "ADMIN" (não modificados): ${adminCount}`);
    
    // Contar número total de usuários no sistema
    const totalUsers = await prisma.user.count();
    console.log(`\nTotal de usuários no sistema: ${totalUsers}`);
    
    // Mostrar nova distribuição de roles
    const newDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });
    
    console.log('\n=== DISTRIBUIÇÃO ATUAL DE ROLES ===');
    newDistribution.forEach(group => {
      console.log(`${group.role}: ${group._count.role} usuários`);
    });
    
  } catch (error) {
    console.error("Erro ao atualizar usuários:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsersToLeader()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 