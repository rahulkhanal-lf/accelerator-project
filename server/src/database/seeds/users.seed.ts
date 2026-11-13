import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity.js';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, '../../**/*.entity.ts')],
  synchronize: false,
});

const NEPALI_USERS: Array<{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  role?: UserRole;
}> = [
  { firstName: 'Aarav',    lastName: 'Sharma',      email: 'aarav.sharma@example.com',      phone: '+977-9801234567', city: 'Kathmandu' },
  { firstName: 'Priya',    lastName: 'Thapa',       email: 'priya.thapa@example.com',       phone: '+977-9802345678', city: 'Pokhara' },
  { firstName: 'Bikash',   lastName: 'Karki',       email: 'bikash.karki@example.com',      phone: '+977-9803456789', city: 'Lalitpur' },
  { firstName: 'Sunita',   lastName: 'Rai',         email: 'sunita.rai@example.com',        phone: '+977-9804567890', city: 'Biratnagar' },
  { firstName: 'Rohan',    lastName: 'Shrestha',    email: 'rohan.shrestha@example.com',    phone: '+977-9805678901', city: 'Bhaktapur' },
  { firstName: 'Anjali',   lastName: 'Tamang',      email: 'anjali.tamang@example.com',     phone: '+977-9806789012', city: 'Kathmandu' },
  { firstName: 'Dipesh',   lastName: 'Adhikari',    email: 'dipesh.adhikari@example.com',   phone: '+977-9807890123', city: 'Chitwan' },
  { firstName: 'Kabita',   lastName: 'Gurung',      email: 'kabita.gurung@example.com',     phone: '+977-9808901234', city: 'Pokhara' },
  { firstName: 'Suresh',   lastName: 'Poudel',      email: 'suresh.poudel@example.com',     phone: '+977-9809012345', city: 'Butwal' },
  { firstName: 'Manisha',  lastName: 'Magar',       email: 'manisha.magar@example.com',     phone: '+977-9800123456', city: 'Dharan' },
  { firstName: 'Prakash',  lastName: 'Bhattarai',   email: 'prakash.bhattarai@example.com', phone: '+977-9811234567', city: 'Kathmandu', role: UserRole.ADMIN },
  { firstName: 'Srijana',  lastName: 'Basnet',      email: 'srijana.basnet@example.com',    phone: '+977-9812345678', city: 'Hetauda' },
  { firstName: 'Nirajan',  lastName: 'Pandey',      email: 'nirajan.pandey@example.com',    phone: '+977-9813456789', city: 'Nepalgunj' },
  { firstName: 'Radhika',  lastName: 'Dhakal',      email: 'radhika.dhakal@example.com',    phone: '+977-9814567890', city: 'Lalitpur' },
  { firstName: 'Bishnu',   lastName: 'Koirala',     email: 'bishnu.koirala@example.com',    phone: '+977-9815678901', city: 'Pokhara' },
];

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(User);

  const passwordHash = await bcrypt.hash('Password@123', 12);

  let created = 0;
  let skipped = 0;

  for (const data of NEPALI_USERS) {
    const exists = await repo.findOneBy({ email: data.email });
    if (exists) { skipped++; continue; }

    const user = repo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      phone: data.phone,
      city: data.city,
      country: 'Nepal',
      role: data.role ?? UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      lastLoginAt: null,
    });

    await repo.save(user);
    created++;
    console.log(`  ✓ ${user.firstName} ${user.lastName} <${user.email}>`);
  }

  await dataSource.destroy();
  console.log(`\nSeeding done — created: ${created}, skipped: ${skipped}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
