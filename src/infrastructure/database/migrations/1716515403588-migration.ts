import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1716515403588 implements MigrationInterface {
	name = 'Migration1716515403588';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "posts"
       (
           "id"         SERIAL    NOT NULL,
           "text"       text      NOT NULL,
           "group_id"   integer,
           "created_at" TIMESTAMP NOT NULL DEFAULT now(),
           "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
           "user_id"    integer,
           CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
       )`
		);
		await queryRunner.query(
			`ALTER TABLE "posts"
          ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "Users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "posts"
          DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"`
		);
		await queryRunner.query(`DROP TABLE "posts"`);
	}
}
