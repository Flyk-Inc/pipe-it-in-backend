import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1718785175340 implements MigrationInterface {
	name = 'Migration1718785175340';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Users"
              ADD "description" character varying`
		);
		await queryRunner.query(`ALTER TABLE "Users"
            ADD "pinnedPost" integer`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "pinnedPost"`);
		await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "description"`);
	}
}
