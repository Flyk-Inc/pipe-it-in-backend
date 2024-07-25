import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721902137985 implements MigrationInterface {
	name = 'Migration1721902137985';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "group_request" ("id" SERIAL NOT NULL, "is_accepted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "requester_id" integer, "group_id" integer, CONSTRAINT "PK_8398f2973e76eaffa70a57ad5bd" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "group_request" ADD CONSTRAINT "FK_78525bcb3ee584077d38db50868" FOREIGN KEY ("requester_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "group_request" ADD CONSTRAINT "FK_c5e3b71f5ee2ca17e7d1296901f" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "group_request" DROP CONSTRAINT "FK_c5e3b71f5ee2ca17e7d1296901f"`
		);
		await queryRunner.query(
			`ALTER TABLE "group_request" DROP CONSTRAINT "FK_78525bcb3ee584077d38db50868"`
		);
		await queryRunner.query(`DROP TABLE "group_request"`);
	}
}
