import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMpinToText1780625843672 implements MigrationInterface {
  name = 'AlterMpinToText1780625843672';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" DROP CONSTRAINT "FK_5bc5eaae811809682dfcb14365e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" ADD CONSTRAINT "UQ_5bc5eaae811809682dfcb14365e" UNIQUE ("transaction_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_credentials" DROP COLUMN "mpin"`,
    );
    await queryRunner.query(`ALTER TABLE "user_credentials" ADD "mpin" text`);
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" ADD CONSTRAINT "FK_5bc5eaae811809682dfcb14365e" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" DROP CONSTRAINT "FK_5bc5eaae811809682dfcb14365e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_credentials" DROP COLUMN "mpin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_credentials" ADD "mpin" character(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" DROP CONSTRAINT "UQ_5bc5eaae811809682dfcb14365e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" ADD CONSTRAINT "FK_5bc5eaae811809682dfcb14365e" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
