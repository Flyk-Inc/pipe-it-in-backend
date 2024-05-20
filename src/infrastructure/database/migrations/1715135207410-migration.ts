import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1715135207410 implements MigrationInterface {
	name = 'Migration1715135207410';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "Users"
       (
           "id"              SERIAL            NOT NULL,
           "email"           character varying NOT NULL,
           "password"        character varying NOT NULL,
           "firstName"       character varying NOT NULL,
           "lastName"        character varying NOT NULL,
           "isActive"        boolean           NOT NULL DEFAULT true,
           "updatedAt"       TIMESTAMP         NOT NULL DEFAULT now(),
           "createdAt"       TIMESTAMP         NOT NULL DEFAULT now(),
           "lastTokenUpdate" TIMESTAMP         NOT NULL DEFAULT now(),
           CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id")
       )`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "Users"`);
	}
}
