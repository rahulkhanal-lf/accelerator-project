import { z } from 'zod';
import { UserRole } from '../entities/user.entity.js';

export const CreateUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().max(20).nullable().optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  role: z.nativeEnum(UserRole).optional(),
  address: z.string().max(255).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
