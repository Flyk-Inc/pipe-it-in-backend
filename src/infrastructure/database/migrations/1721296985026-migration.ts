import { MigrationInterface, QueryRunner } from 'typeorm';
import { FileTypes } from '../../../domain/pipelines/file_type.entities';

export class Migration1721296985026 implements MigrationInterface {
	name = 'Migration1721296985026';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "files" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "size" integer NOT NULL, "storage_path" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Pipeline_Run_Steps" ("id" SERIAL NOT NULL, "step" integer, "executed" boolean NOT NULL DEFAULT false, "error" boolean NOT NULL DEFAULT false, "stdout" text, "stderr" text, "needsInput" boolean NOT NULL, "codeContent" text NOT NULL, "language" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "runId" integer, "inputFileId" integer, "outputFileId" integer, "codeId" integer, "userId" integer, CONSTRAINT "PK_195d5e2c73fcaf02fdbcae65b53" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Runs" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "pipelineId" integer, CONSTRAINT "PK_b3706ebd76a00b72af0469b79f2" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Pipelines" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_f0e413e13370f1a3d97e8ff4082" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Pipeline_Codes" ("id" SERIAL NOT NULL, "step" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "versionId" integer, "pipelineId" integer, CONSTRAINT "PK_29b152318c7944a48c927cf18f9" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "FileTypes" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "extension" character varying NOT NULL, "description" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cfef5cca1f611d83c0e6f3c5ee5" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Input_Descriptions" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "fileTypeId" integer, "versionId" integer, "codeId" integer, CONSTRAINT "PK_b0852459adecef61a4efa997f25" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Output_Descriptions" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "fileTypeId" integer, "versionId" integer, "codeId" integer, CONSTRAINT "PK_88c2a5d8a6e11f69c574137fe33" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Versions" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "version" character varying NOT NULL, "description" text NOT NULL, "status" character varying NOT NULL, "codeContent" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "codeId" integer, CONSTRAINT "PK_be10f4661349532626e5bc200bc" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "Codes" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "draft" text NOT NULL DEFAULT '', "language" character varying NOT NULL, "versionTitleDraft" character varying NOT NULL DEFAULT '', "versionDescriptionDraft" character varying NOT NULL DEFAULT '', "versionVersionDraft" character varying NOT NULL DEFAULT '', "status" character varying NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, CONSTRAINT "PK_0b5a3b55a578f9487efa094c9ea" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "Users" ADD "profile_picture" integer`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD CONSTRAINT "FK_d72a6047365a86d162467e9febb" FOREIGN KEY ("runId") REFERENCES "Runs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD CONSTRAINT "FK_2862dc55d7369475adbf7a8cb16" FOREIGN KEY ("inputFileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD CONSTRAINT "FK_f97843b0cba0dbad5b65faaf878" FOREIGN KEY ("outputFileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD CONSTRAINT "FK_c01ab53e1027e2367e51fd59203" FOREIGN KEY ("codeId") REFERENCES "Codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" ADD CONSTRAINT "FK_2348e98c3674d25ba756836e10a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Runs" ADD CONSTRAINT "FK_7c30c4aa056288f990db19f9fe4" FOREIGN KEY ("pipelineId") REFERENCES "Pipelines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipelines" ADD CONSTRAINT "FK_e8f1db3ef96981224bf43d8f327" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Codes" ADD CONSTRAINT "FK_f2ec3d341aee3be16f08d5e08a8" FOREIGN KEY ("versionId") REFERENCES "Versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Codes" ADD CONSTRAINT "FK_445dd0a2a9044782f3a824d41a8" FOREIGN KEY ("pipelineId") REFERENCES "Pipelines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Input_Descriptions" ADD CONSTRAINT "FK_fbe1336ff93ce8d77ecf8c0d135" FOREIGN KEY ("fileTypeId") REFERENCES "FileTypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Input_Descriptions" ADD CONSTRAINT "FK_2ab300e9d75d19a9bf0979dc94f" FOREIGN KEY ("versionId") REFERENCES "Versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Input_Descriptions" ADD CONSTRAINT "FK_4e7cf26d39b59df2e3a44362b06" FOREIGN KEY ("codeId") REFERENCES "Codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Output_Descriptions" ADD CONSTRAINT "FK_4aae005d7c00d58e1bbdbdfabdc" FOREIGN KEY ("fileTypeId") REFERENCES "FileTypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Output_Descriptions" ADD CONSTRAINT "FK_f13d6dc4e0799fe2e792267612e" FOREIGN KEY ("versionId") REFERENCES "Versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Output_Descriptions" ADD CONSTRAINT "FK_d7646282173dce79f4c1a29e980" FOREIGN KEY ("codeId") REFERENCES "Codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Versions" ADD CONSTRAINT "FK_1483c6d28b5bfae35443b03c377" FOREIGN KEY ("codeId") REFERENCES "Codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Codes" ADD CONSTRAINT "FK_79e536957cee62d4f2d533c9c28" FOREIGN KEY ("authorId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "Users" ADD CONSTRAINT "FK_9095be1b8403c6609e4d0bb87c8" FOREIGN KEY ("profile_picture") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		const fileTypesRepository = queryRunner.manager.getRepository(FileTypes);
		await fileTypesRepository.save([
			{
				name: 'PNG Image',
				extension: 'png',
				description: 'PNG image file format',
			},
			{
				name: 'JPEG Image',
				extension: 'jpg',
				description: 'JPEG image file format',
			},
			{
				name: 'Text File',
				extension: 'txt',
				description: 'Plain text file format',
			},
		]);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "Users" DROP CONSTRAINT "FK_9095be1b8403c6609e4d0bb87c8"`
		);
		await queryRunner.query(
			`ALTER TABLE "Codes" DROP CONSTRAINT "FK_79e536957cee62d4f2d533c9c28"`
		);
		await queryRunner.query(
			`ALTER TABLE "Versions" DROP CONSTRAINT "FK_1483c6d28b5bfae35443b03c377"`
		);
		await queryRunner.query(
			`ALTER TABLE "Output_Descriptions" DROP CONSTRAINT "FK_d7646282173dce79f4c1a29e980"`
		);
		await queryRunner.query(
			`ALTER TABLE "Output_Descriptions" DROP CONSTRAINT "FK_f13d6dc4e0799fe2e792267612e"`
		);
		await queryRunner.query(
			`ALTER TABLE "Output_Descriptions" DROP CONSTRAINT "FK_4aae005d7c00d58e1bbdbdfabdc"`
		);
		await queryRunner.query(
			`ALTER TABLE "Input_Descriptions" DROP CONSTRAINT "FK_4e7cf26d39b59df2e3a44362b06"`
		);
		await queryRunner.query(
			`ALTER TABLE "Input_Descriptions" DROP CONSTRAINT "FK_2ab300e9d75d19a9bf0979dc94f"`
		);
		await queryRunner.query(
			`ALTER TABLE "Input_Descriptions" DROP CONSTRAINT "FK_fbe1336ff93ce8d77ecf8c0d135"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Codes" DROP CONSTRAINT "FK_445dd0a2a9044782f3a824d41a8"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Codes" DROP CONSTRAINT "FK_f2ec3d341aee3be16f08d5e08a8"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipelines" DROP CONSTRAINT "FK_e8f1db3ef96981224bf43d8f327"`
		);
		await queryRunner.query(
			`ALTER TABLE "Runs" DROP CONSTRAINT "FK_7c30c4aa056288f990db19f9fe4"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP CONSTRAINT "FK_2348e98c3674d25ba756836e10a"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP CONSTRAINT "FK_c01ab53e1027e2367e51fd59203"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP CONSTRAINT "FK_f97843b0cba0dbad5b65faaf878"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP CONSTRAINT "FK_2862dc55d7369475adbf7a8cb16"`
		);
		await queryRunner.query(
			`ALTER TABLE "Pipeline_Run_Steps" DROP CONSTRAINT "FK_d72a6047365a86d162467e9febb"`
		);
		await queryRunner.query(
			`ALTER TABLE "Users" DROP COLUMN "profile_picture"`
		);
		await queryRunner.query(`DROP TABLE "Codes"`);
		await queryRunner.query(`DROP TABLE "Versions"`);
		await queryRunner.query(`DROP TABLE "Output_Descriptions"`);
		await queryRunner.query(`DROP TABLE "Input_Descriptions"`);
		await queryRunner.query(`DROP TABLE "FileTypes"`);
		await queryRunner.query(`DROP TABLE "Pipeline_Codes"`);
		await queryRunner.query(`DROP TABLE "Pipelines"`);
		await queryRunner.query(`DROP TABLE "Runs"`);
		await queryRunner.query(`DROP TABLE "Pipeline_Run_Steps"`);
		await queryRunner.query(`DROP TABLE "files"`);
	}
}
