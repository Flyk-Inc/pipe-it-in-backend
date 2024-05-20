import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1716234662460 implements MigrationInterface {
    name = 'Migration1716234662460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Groups" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "isPrivate" boolean NOT NULL DEFAULT false, "profilePicture" integer, "pinnedPost" integer, "creatorId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be8543c3ec161e109d124cf9498" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GroupMembers" ("id" SERIAL NOT NULL, "groupId" integer NOT NULL, "userId" integer NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), "isBanned" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_3dbe4bce2ac3b8d9ed99371000e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Groups" ADD CONSTRAINT "FK_663b2482d223ae4eee408bd3d5d" FOREIGN KEY ("creatorId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GroupMembers" ADD CONSTRAINT "FK_620c0c144747b4a30137427ffd9" FOREIGN KEY ("groupId") REFERENCES "Groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GroupMembers" ADD CONSTRAINT "FK_a70b5d3d0ffb8e50f1b151962a3" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "GroupMembers" DROP CONSTRAINT "FK_a70b5d3d0ffb8e50f1b151962a3"`);
        await queryRunner.query(`ALTER TABLE "GroupMembers" DROP CONSTRAINT "FK_620c0c144747b4a30137427ffd9"`);
        await queryRunner.query(`ALTER TABLE "Groups" DROP CONSTRAINT "FK_663b2482d223ae4eee408bd3d5d"`);
        await queryRunner.query(`DROP TABLE "GroupMembers"`);
        await queryRunner.query(`DROP TABLE "Groups"`);
    }

}
