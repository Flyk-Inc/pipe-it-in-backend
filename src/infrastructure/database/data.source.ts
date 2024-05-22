import { DataSource, DataSourceOptions } from 'typeorm';
import { configDotenv } from 'dotenv';

configDotenv();

export const dbdatasource: DataSourceOptions = {
	// TypeORM PostgreSQL DB Drivers
	type: 'postgres',
	host: process.env.POSTGRES_HOST,
	port: parseInt(process.env.POSTGRES_PORT),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	synchronize: false,
	entities: ['dist/**/*.entities.{js,ts}'],
	migrations: ['dist/**/*migration.{js,ts}'],
	ssl: process.env.ENVIRONMENT === 'production',
	extra:
		process.env.ENVIRONMENT === 'production'
			? {
					ssl: {
						rejectUnauthorized: false,
					},
				}
			: undefined,
};

const dataSource = new DataSource(dbdatasource);
export default dataSource;
