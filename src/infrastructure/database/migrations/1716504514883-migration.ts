import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1716504514883 implements MigrationInterface {
	name = 'Migration1716504514883';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "user_follows" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "follower_id" integer, "user_id" integer, CONSTRAINT "PK_da8e8793113adf3015952880966" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "follow_request" ("id" SERIAL NOT NULL, "is_accepted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "follower_id" integer, "user_id" integer, CONSTRAINT "PK_53a9aa3725f7a3deb150b39dbfc" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "Users" ADD "isPrivate" boolean NOT NULL DEFAULT false`
		);
		await queryRunner.query(
			`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_f7af3bf8f2dcba61b4adc108239" FOREIGN KEY ("follower_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_c197e948ae00e07dd980e9fcc6b" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "follow_request" ADD CONSTRAINT "FK_20235ec29d53b663abc82cb397c" FOREIGN KEY ("follower_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "follow_request" ADD CONSTRAINT "FK_7e0a8763baa18a60072691952b8" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "follow_request" DROP CONSTRAINT "FK_7e0a8763baa18a60072691952b8"`
		);
		await queryRunner.query(
			`ALTER TABLE "follow_request" DROP CONSTRAINT "FK_20235ec29d53b663abc82cb397c"`
		);
		await queryRunner.query(
			`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_c197e948ae00e07dd980e9fcc6b"`
		);
		await queryRunner.query(
			`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_f7af3bf8f2dcba61b4adc108239"`
		);
		await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "isPrivate"`);
		await queryRunner.query(`DROP TABLE "follow_request"`);
		await queryRunner.query(`DROP TABLE "user_follows"`);
	}
}
