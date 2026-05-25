import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthFieldsToUser1748131200000 implements MigrationInterface {
  name = 'AddAuthFieldsToUser1748131200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "password"     VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "active_token" TEXT,
        ADD COLUMN IF NOT EXISTS "monthly_income" DECIMAL(15,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "savings_goal"   DECIMAL(15,2) NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "password",
        DROP COLUMN IF EXISTS "active_token",
        DROP COLUMN IF EXISTS "monthly_income",
        DROP COLUMN IF EXISTS "savings_goal"
    `);
  }
}
