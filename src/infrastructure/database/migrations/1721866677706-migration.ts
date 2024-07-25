import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721866677706 implements MigrationInterface {
	name = 'Migration1721866677706';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Groups" RENAME COLUMN "profilePicture" TO "profile_picture"`
		);
		await queryRunner.query(
			`ALTER TABLE "Groups"
              ADD CONSTRAINT "FK_a66a2959ff540965a98b0f720d2" FOREIGN KEY ("profile_picture") REFERENCES "files" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Groups" DROP CONSTRAINT "FK_a66a2959ff540965a98b0f720d2"`
		);
		await queryRunner.query(
			`ALTER TABLE "Groups" RENAME COLUMN "profile_picture" TO "profilePicture"`
		);
	}
}
