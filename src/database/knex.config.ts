import { Knex } from 'knex';
import * as dotenv from 'dotenv';
dotenv.config();

export const knexConfig: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL as string, // <── READ FROM .env
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    extension: 'ts',
    directory: './migrations',
  },
};
