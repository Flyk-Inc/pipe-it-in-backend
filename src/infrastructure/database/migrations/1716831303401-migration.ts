import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1716831303401 implements MigrationInterface {
	name = 'Migration1716831303401';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "comments"
           (
               "id"         SERIAL    NOT NULL,
               "content"    text      NOT NULL,
               "created_at" TIMESTAMP NOT NULL DEFAULT now(),
               "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
               "user_id"    integer,
               "post_id"    integer,
               "parent_id"  integer,
               CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id")
           )`
		);
		await queryRunner.query(
			`ALTER TABLE "comments"
              ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "Users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "comments"
              ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "comments"
              ADD CONSTRAINT "FK_d6f93329801a93536da4241e386" FOREIGN KEY ("parent_id") REFERENCES "comments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "comments" DROP CONSTRAINT "FK_d6f93329801a93536da4241e386"`
		);
		await queryRunner.query(
			`ALTER TABLE "comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"`
		);
		await queryRunner.query(
			`ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`
		);
		await queryRunner.query(`DROP TABLE "comments"`);
	}
}
