import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1720704179342 implements MigrationInterface {
	name = 'Migration1720704179342';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Users"
              ADD "profilePicture" character varying`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "profilePicture"`);
	}
}
