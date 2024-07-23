import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721696794420 implements MigrationInterface {
	name = 'Migration1721696794420';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "posts" ADD "version_id" integer`);
		await queryRunner.query(
			`ALTER TABLE "posts" ADD CONSTRAINT "FK_10fbc8f6f04dca334afaaef9fe3" FOREIGN KEY ("version_id") REFERENCES "Versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "posts" DROP CONSTRAINT "FK_10fbc8f6f04dca334afaaef9fe3"`
		);
		await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "version_id"`);
	}
}
