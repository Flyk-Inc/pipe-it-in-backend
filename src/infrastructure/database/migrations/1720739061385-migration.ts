import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1720739061385 implements MigrationInterface {
	name = 'Migration1720739061385';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Users"
              ADD "profile_picture" integer`
		);
		await queryRunner.query(
			`ALTER TABLE "Users"
              ADD CONSTRAINT "FK_9095be1b8403c6609e4d0bb87c8" FOREIGN KEY ("profile_picture") REFERENCES "files" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Users" DROP CONSTRAINT "FK_9095be1b8403c6609e4d0bb87c8"`
		);
		await queryRunner.query(
			`ALTER TABLE "Users" DROP COLUMN "profile_picture"`
		);
	}
}
