import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1716930866445 implements MigrationInterface {
	name = 'Migration1716930866445';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "reactions"
           (
               "id"         SERIAL    NOT NULL,
               "is_like"    boolean   NOT NULL,
               "created_at" TIMESTAMP NOT NULL DEFAULT now(),
               "user_id"    integer,
               "comment_id" integer,
               CONSTRAINT "PK_0b213d460d0c473bc2fb6ee27f3" PRIMARY KEY ("id")
           )`
		);
		await queryRunner.query(
			`ALTER TABLE "reactions"
              ADD CONSTRAINT "FK_dde6062145a93649adc5af3946e" FOREIGN KEY ("user_id") REFERENCES "Users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "reactions"
              ADD CONSTRAINT "FK_bbea5deba8e9118ad08429c9104" FOREIGN KEY ("comment_id") REFERENCES "comments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "reactions" DROP CONSTRAINT "FK_bbea5deba8e9118ad08429c9104"`
		);
		await queryRunner.query(
			`ALTER TABLE "reactions" DROP CONSTRAINT "FK_dde6062145a93649adc5af3946e"`
		);
		await queryRunner.query(`DROP TABLE "reactions"`);
	}
}
