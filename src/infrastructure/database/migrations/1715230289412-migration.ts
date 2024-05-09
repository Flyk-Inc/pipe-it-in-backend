import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1715230289412 implements MigrationInterface {
  name = 'Migration1715230289412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "Roles"
                             (
                                 "id"          SERIAL            NOT NULL,
                                 "name"        character varying NOT NULL,
                                 "description" character varying NOT NULL,
                                 "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
                                 "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_efba48c6a0c7a9b6260f771b165" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "UserRoles"
                             (
                                 "usersId" integer NOT NULL,
                                 "rolesId" integer NOT NULL,
                                 CONSTRAINT "PK_41f29aa90a36836859f102ad6c7" PRIMARY KEY ("usersId", "rolesId")
                             )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_80547a481dff59f01c1cc7ef3a" ON "UserRoles" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_98cefa4e99eff3fd0c9116431c" ON "UserRoles" ("rolesId") `,
    );
    await queryRunner.query(`ALTER TABLE "UserRoles"
        ADD CONSTRAINT "FK_80547a481dff59f01c1cc7ef3a2" FOREIGN KEY ("usersId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "UserRoles"
        ADD CONSTRAINT "FK_98cefa4e99eff3fd0c9116431ca" FOREIGN KEY ("rolesId") REFERENCES "Roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);

    await queryRunner.query(`INSERT INTO "Roles" (name, description, "updatedAt", "createdAt")
                             VALUES ('admin', 'Admin role', now(), now())`);
    await queryRunner.query(`INSERT INTO "Roles" (name, description, "updatedAt", "createdAt")
                             VALUES ('user', 'User role', now(), now())`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "UserRoles"
        DROP CONSTRAINT "FK_98cefa4e99eff3fd0c9116431ca"`);
    await queryRunner.query(`ALTER TABLE "UserRoles"
        DROP CONSTRAINT "FK_80547a481dff59f01c1cc7ef3a2"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_98cefa4e99eff3fd0c9116431c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_80547a481dff59f01c1cc7ef3a"`,
    );
    await queryRunner.query(`DROP TABLE "UserRoles"`);
    await queryRunner.query(`DROP TABLE "Roles"`);
  }
}
