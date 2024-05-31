import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1716925329265 implements MigrationInterface {
	name = 'Migration1716925329265';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "likes" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "post_id" integer, CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "likes"
              ADD CONSTRAINT "FK_3f519ed95f775c781a254089171" FOREIGN KEY ("user_id") REFERENCES "Users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "likes" ADD CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "likes" DROP CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff"`
		);
		await queryRunner.query(
			`ALTER TABLE "likes" DROP CONSTRAINT "FK_3f519ed95f775c781a254089171"`
		);
		await queryRunner.query(`DROP TABLE "likes"`);
	}
}
