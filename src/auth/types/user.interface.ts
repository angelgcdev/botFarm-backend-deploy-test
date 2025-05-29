import { user } from '@prisma/client';

export type User = Omit<user, 'password'>;
