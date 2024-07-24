import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721829196021 implements MigrationInterface {
	name = 'Migration1721829196021';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Pipelines" ADD "status" character varying NOT NULL DEFAULT 'active'`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "Pipelines" DROP COLUMN "status"`);
	}
}
