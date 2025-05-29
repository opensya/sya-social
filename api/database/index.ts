import { DataSource, DataSourceOptions } from "typeorm";
import entitys from "./entitys";
import { Client } from "pg";

export let dataSource: DataSource;

export const ConfigDatabase = () => {
  const config = {
    type: "postgres",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "secret",
    database: process.env.DB_NAME || "form",
    port: process.env.DB_PORT || 5432,
    host: process.env.DB_HOST || "localhost",
    synchronize: true,
    logging: false,
    entities: entitys,
  };

  return config as DataSourceOptions;
};

export const CreateDatabase = async () => {
  try {
    const config = ConfigDatabase();

    dataSource = new DataSource(config);
  } catch (error) {
    throw error;
  }

  await dataSource.initialize();

  return dataSource;
};


export async function createDatabaseIfNotExists() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres", // Se connecter à la base système
  });

  await client.connect();

  const dbName = process.env.DB_NAME;

  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
  );

  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
  }

  await client.end();
}
