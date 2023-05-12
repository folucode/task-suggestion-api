import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1683796706666 implements MigrationInterface {
  name = 'New1683796706666';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" ADD "priority" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);
  }
}
