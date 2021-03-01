import { join } from 'path';
import { object, string, number } from 'joi';

export const DB_SCHEMA = object({
  dbname: string(),
  username: string(),
  password: string(),
  port: number(),
  host: string(),
});
