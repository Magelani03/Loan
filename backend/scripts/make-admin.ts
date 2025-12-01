import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'ssylvanus516@gmail.com';
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  });
  console.log(`Updated ${user.email} to role=${user.role}`);
}

main()
  .catch((e) => {
    console.error('Error promoting admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
