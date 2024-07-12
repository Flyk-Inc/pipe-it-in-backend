import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1720781124767 implements MigrationInterface {
	name = 'Migration1720781124767';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ALTER COLUMN "stdout" DROP NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ALTER COLUMN "stderr" DROP NOT NULL`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ALTER COLUMN "stderr" SET NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ALTER COLUMN "stdout" SET NOT NULL`
		);
	}
}
