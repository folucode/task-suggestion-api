import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1683628219528 implements MigrationInterface {
  name = 'New1683628219528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
    await queryRunner.query(
      `ALTER TABLE "task" ADD "userId" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "userId" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "username" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "password" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_d72ea127f30e21753c9e229891e"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lastName" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "firstName" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
  }
}
