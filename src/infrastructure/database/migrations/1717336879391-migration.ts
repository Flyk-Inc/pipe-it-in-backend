import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1717336879391 implements MigrationInterface {
	name = 'Migration1717336879391';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE "tags"
                             (
                                 "id"   SERIAL            NOT NULL,
                                 "name" character varying NOT NULL,
                                 CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")
                             )`);
		await queryRunner.query(`CREATE TABLE "post_tags"
                             (
                                 "post_id" integer NOT NULL,
                                 "tag_id"  integer NOT NULL,
                                 CONSTRAINT "PK_deee54a40024b7afc16d25684f8" PRIMARY KEY ("post_id", "tag_id")
                             )`);
		await queryRunner.query(
			`CREATE INDEX "IDX_5df4e8dc2cb3e668b962362265" ON "post_tags" ("post_id") `
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_192ab488d1c284ac9abe2e3035" ON "post_tags" ("tag_id") `
		);
		await queryRunner.query(`ALTER TABLE "post_tags"
        ADD CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
		await queryRunner.query(`ALTER TABLE "post_tags"
        ADD CONSTRAINT "FK_192ab488d1c284ac9abe2e30356" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_192ab488d1c284ac9abe2e30356"`
		);
		await queryRunner.query(
			`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d"`
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_192ab488d1c284ac9abe2e3035"`
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_5df4e8dc2cb3e668b962362265"`
		);
		await queryRunner.query(`DROP TABLE "post_tags"`);
		await queryRunner.query(`DROP TABLE "tags"`);
	}
}
