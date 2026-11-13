import { z } from 'zod';
import { CreateUserSchema } from './create-user.dto.js';

export const UpdateUserSchema = CreateUserSchema.omit({ password: true }).partial();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
