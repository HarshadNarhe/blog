import e from 'express';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
    port: 5432,
    username: 'devuser',
    password: 'admin',
    database: 'blog',
    schema: 'public',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};

const AppDataSource = new DataSource(config);

export  {AppDataSource};

export default config;
