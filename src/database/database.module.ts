import { Module } from '@nestjs/common';
import knex from 'knex';
import { KNEX_CONNECTION } from './knex.tokens';
import { knexConfig } from './knex.config';

@Module({
  providers: [
    {
      provide: KNEX_CONNECTION,
      useFactory: () => knex(knexConfig),
    },
  ],
  exports: [KNEX_CONNECTION],
})
export class DatabaseModule {}
