import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1721052024882 implements MigrationInterface {
	name = 'Migration1721052024882';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP CONSTRAINT "FK_c3b7ab1199a0aa0dbaa11cf744e"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP COLUMN "versionId"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD "needsInput" boolean NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD "codeContent" text NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD "language" character varying NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD "codeId" integer`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD "userId" integer`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ALTER COLUMN "step" DROP NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD CONSTRAINT "FK_c01ab53e1027e2367e51fd59203" FOREIGN KEY ("codeId") REFERENCES "Codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD CONSTRAINT "FK_2348e98c3674d25ba756836e10a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP CONSTRAINT "FK_2348e98c3674d25ba756836e10a"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP CONSTRAINT "FK_c01ab53e1027e2367e51fd59203"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ALTER COLUMN "step" SET NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP COLUMN "userId"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP COLUMN "codeId"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP COLUMN "language"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP COLUMN "codeContent"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP COLUMN "needsInput"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD "versionId" integer`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD CONSTRAINT "FK_c3b7ab1199a0aa0dbaa11cf744e" FOREIGN KEY ("versionId") REFERENCES "Versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}
}
