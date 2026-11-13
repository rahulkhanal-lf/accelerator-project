import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserStatus } from '../../users/entities/user.entity.js';
import { AppDataSource } from '../data-source.js';

const dataSource = AppDataSource;

const USERS: Array<{
  firstName: string;
  lastName: string;
  email: string;
}> = [
  { firstName: 'Aarav',   lastName: 'Sharma',    email: 'aarav.sharma@example.com'    },
  { firstName: 'Priya',   lastName: 'Thapa',     email: 'priya.thapa@example.com'     },
  { firstName: 'Bikash',  lastName: 'Karki',     email: 'bikash.karki@example.com'    },
  { firstName: 'Sunita',  lastName: 'Rai',       email: 'sunita.rai@example.com'      },
  { firstName: 'Rohan',   lastName: 'Shrestha',  email: 'rohan.shrestha@example.com'  },
  { firstName: 'Anjali',  lastName: 'Tamang',    email: 'anjali.tamang@example.com'   },
  { firstName: 'Dipesh',  lastName: 'Adhikari',  email: 'dipesh.adhikari@example.com' },
  { firstName: 'Kabita',  lastName: 'Gurung',    email: 'kabita.gurung@example.com'   },
  { firstName: 'Suresh',  lastName: 'Poudel',    email: 'suresh.poudel@example.com'   },
  { firstName: 'Manisha', lastName: 'Magar',     email: 'manisha.magar@example.com'   },
  { firstName: 'Prakash', lastName: 'Bhattarai', email: 'prakash.bhattarai@example.com' },
  { firstName: 'Srijana', lastName: 'Basnet',    email: 'srijana.basnet@example.com'  },
  { firstName: 'Nirajan', lastName: 'Pandey',    email: 'nirajan.pandey@example.com'  },
  { firstName: 'Radhika', lastName: 'Dhakal',    email: 'radhika.dhakal@example.com'  },
  { firstName: 'Bishnu',  lastName: 'Koirala',   email: 'bishnu.koirala@example.com'  },
];

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(UserEntity);

  const passwordHash = await bcrypt.hash('Password@123', 12);

  let created = 0;
  let skipped = 0;

  for (const data of USERS) {
    const exists = await repo.findOneBy({ email: data.email });
    if (exists) { skipped++; continue; }

    const user = repo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      status: UserStatus.ACTIVE,
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
