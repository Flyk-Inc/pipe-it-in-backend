import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1716162955527 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "Groups"
                             (
                                 "id"          SERIAL            NOT NULL,
                                 "name"        character varying NOT NULL,
                                 "description" character varying,
                                 "isPrivate"   boolean           NOT NULL DEFAULT false,
                                 "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
                                 "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_46db72c024a7c1e41038d3a357e" PRIMARY KEY ("id")
                             )`);

    await queryRunner.query(`CREATE TABLE "GroupMembers"
                             (
                                 "groupId" integer NOT NULL,
                                 "userId"  integer NOT NULL,
                                 "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_a6e8de3d7f71e83946e6a0d6192" PRIMARY KEY ("groupId", "userId")
                             )`);

    await queryRunner.query(`CREATE TABLE "GroupAdmins"
                             (
                                 "groupId" integer NOT NULL,
                                 "userId"  integer NOT NULL,
                                 CONSTRAINT "PK_3d01d71c8b70b8a65a91b4013a6" PRIMARY KEY ("groupId", "userId")
                             )`);

    await queryRunner.query(
      `CREATE INDEX "IDX_9b8e9dbca4ef1e4e13c28b578c" ON "GroupMembers" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76c17d3ab7448ff5db8e785bc5" ON "GroupMembers" ("userId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_876345785f23e89127d8a7d1ec" ON "GroupAdmins" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09a7a53e91ebdc683b04a1f86d" ON "GroupAdmins" ("userId") `,
    );

    await queryRunner.query(`ALTER TABLE "GroupMembers"
        ADD CONSTRAINT "FK_9b8e9dbca4ef1e4e13c28b578cd" FOREIGN KEY ("groupId") REFERENCES "Groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "GroupMembers"
        ADD CONSTRAINT "FK_76c17d3ab7448ff5db8e785bc52" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);

    await queryRunner.query(`ALTER TABLE "GroupAdmins"
        ADD CONSTRAINT "FK_876345785f23e89127d8a7d1ec0" FOREIGN KEY ("groupId") REFERENCES "Groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "GroupAdmins"
        ADD CONSTRAINT "FK_09a7a53e91ebdc683b04a1f86d5" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "GroupAdmins"
        DROP CONSTRAINT "FK_09a7a53e91ebdc683b04a1f86d5"`);
    await queryRunner.query(`ALTER TABLE "GroupAdmins"
        DROP CONSTRAINT "FK_876345785f23e89127d8a7d1ec0"`);
    await queryRunner.query(`ALTER TABLE "GroupMembers"
        DROP CONSTRAINT "FK_76c17d3ab7448ff5db8e785bc52"`);
    await queryRunner.query(`ALTER TABLE "GroupMembers"
        DROP CONSTRAINT "FK_9b8e9dbca4ef1e4e13c28b578cd"`);

    await queryRunner.query(
      `DROP INDEX "public"."IDX_09a7a53e91ebdc683b04a1f86d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_876345785f23e89127d8a7d1ec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_76c17d3ab7448ff5db8e785bc5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9b8e9dbca4ef1e4e13c28b578c"`,
    );

    await queryRunner.query(`DROP TABLE "GroupAdmins"`);
    await queryRunner.query(`DROP TABLE "GroupMembers"`);
    await queryRunner.query(`DROP TABLE "Groups"`);
  }
}
