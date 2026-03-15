import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.EMAIL || process.argv[2];
  if (!email) {
    console.error('Usage: EMAIL=you@example.com npx ts-node scripts/make-admin.ts');
    console.error('   or: npx ts-node scripts/make-admin.ts you@example.com');
    process.exit(1);
  }
  const user = await prisma.user.update({
    where: { email: email.trim() },
    data: { role: 'admin' },
  });
  console.log(`Updated ${user.email} to role=${user.role}. They can now log in to the admin app.`);
}

main()
  .catch((e) => {
    console.error('Error promoting admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
