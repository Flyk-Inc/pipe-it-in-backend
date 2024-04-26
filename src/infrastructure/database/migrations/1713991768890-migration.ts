import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1713991768890 implements MigrationInterface {
  name = 'Migration1713991768890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "Users"
                             (
                                 "id"        SERIAL            NOT NULL,
                                 "email"     character varying NOT NULL,
                                 "firstName" character varying NOT NULL,
                                 "lastName"  character varying NOT NULL,
                                 CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "Users"`);
  }
}
