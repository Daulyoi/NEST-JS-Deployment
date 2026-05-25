import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSchemaForMLPipeline1748044800000 implements MigrationInterface {
  name = 'UpdateSchemaForMLPipeline1748044800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Users table: add ML columns ────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "id_user" VARCHAR(20) UNIQUE,
        ADD COLUMN IF NOT EXISTS "persona" VARCHAR(20),
        ADD COLUMN IF NOT EXISTS "current_wants_ratio" NUMERIC(5,4) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "current_needs_ratio" NUMERIC(5,4) NOT NULL DEFAULT 0
    `);

    // ── 2. Transactions table: drop old columns, add new ML-aligned columns ───
    // Drop old columns that no longer apply
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN IF EXISTS "amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN IF EXISTS "merchant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN IF EXISTS "category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN IF EXISTS "subcategory"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN IF EXISTS "anomaly_score"`,
    );

    // Add new columns
    await queryRunner.query(`
      ALTER TABLE "transactions"
        ADD COLUMN IF NOT EXISTS "id_user" VARCHAR(20),
        ADD COLUMN IF NOT EXISTS "tipe_mutasi" VARCHAR(10),
        ADD COLUMN IF NOT EXISTS "nominal" BIGINT,
        ADD COLUMN IF NOT EXISTS "kategori_detail" VARCHAR(50),
        ADD COLUMN IF NOT EXISTS "deskripsi_mutasi" VARCHAR(200) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "catatan_mutasi" VARCHAR(500) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "sisa_saldo" BIGINT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "hari_minggu" INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "hari_bulan" INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "jam" INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "kategori_besar" VARCHAR(20)
    `);

    // Rename timestamp if it's missing (it existed as timestamptz already)
    await queryRunner
      .query(
        `
      ALTER TABLE "transactions"
        ALTER COLUMN "timestamp" TYPE TIMESTAMPTZ USING "timestamp"::TIMESTAMPTZ
    `,
      )
      .catch(() => {
        /* column already correct type */
      });

    // Index for ML queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_user_timestamp"
        ON "transactions" ("id_user", "timestamp")
    `);

    // ── 3. weekly_reports ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "weekly_reports" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"          VARCHAR(20) NOT NULL,
        "report_date"      DATE NOT NULL,
        "period_start"     DATE NOT NULL,
        "period_end"       DATE NOT NULL,
        "persona"          VARCHAR(20) NOT NULL,
        "wants_ratio"      NUMERIC(5,4) NOT NULL,
        "needs_ratio"      NUMERIC(5,4) NOT NULL,
        "total_pengeluaran" BIGINT NOT NULL,
        "anomali_count"    INTEGER NOT NULL DEFAULT 0,
        "report_text"      TEXT NOT NULL,
        "generated_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_weekly_user_date" UNIQUE ("user_id", "report_date")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_weekly_reports_user_date"
        ON "weekly_reports" ("user_id", "report_date" DESC)
    `);

    // ── 4. monthly_reports ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "monthly_reports" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"             VARCHAR(20) NOT NULL,
        "target_month"        CHAR(7) NOT NULL,
        "persona"             VARCHAR(20) NOT NULL,
        "persona_sebelum"     VARCHAR(20),
        "savings_rate"        NUMERIC(6,4) NOT NULL,
        "wants_ratio"         NUMERIC(5,4) NOT NULL,
        "needs_ratio"         NUMERIC(5,4) NOT NULL,
        "wants_amount"        BIGINT NOT NULL,
        "needs_amount"        BIGINT NOT NULL,
        "savings_amount"      BIGINT NOT NULL,
        "behavioral_features" JSONB,
        "report_text"         TEXT NOT NULL,
        "generated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_monthly_user_month" UNIQUE ("user_id", "target_month")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_monthly_reports_user_month"
        ON "monthly_reports" ("user_id", "target_month" DESC)
    `);

    // ── 5. detected_anomalies ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "detected_anomalies" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "id_transaksi"    VARCHAR(50) NOT NULL,
        "user_id"         VARCHAR(20) NOT NULL,
        "report_type"     VARCHAR(10) NOT NULL CHECK ("report_type" IN ('weekly', 'monthly')),
        "report_id"       UUID NOT NULL,
        "kategori_detail" VARCHAR(50) NOT NULL,
        "nominal"         BIGINT NOT NULL,
        "mae"             DOUBLE PRECISION NOT NULL,
        "threshold_val"   DOUBLE PRECISION NOT NULL,
        "ratio"           DOUBLE PRECISION NOT NULL,
        "anomaly_context" TEXT,
        "detected_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_anomalies_user"
        ON "detected_anomalies" ("user_id", "detected_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new tables
    await queryRunner.query(`DROP TABLE IF EXISTS "detected_anomalies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "monthly_reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "weekly_reports"`);

    // Revert transactions (restore old columns, drop new ones)
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_transactions_user_timestamp"`,
    );
    await queryRunner.query(`
      ALTER TABLE "transactions"
        DROP COLUMN IF EXISTS "id_user",
        DROP COLUMN IF EXISTS "tipe_mutasi",
        DROP COLUMN IF EXISTS "nominal",
        DROP COLUMN IF EXISTS "kategori_detail",
        DROP COLUMN IF EXISTS "deskripsi_mutasi",
        DROP COLUMN IF EXISTS "catatan_mutasi",
        DROP COLUMN IF EXISTS "sisa_saldo",
        DROP COLUMN IF EXISTS "hari_minggu",
        DROP COLUMN IF EXISTS "hari_bulan",
        DROP COLUMN IF EXISTS "jam",
        DROP COLUMN IF EXISTS "kategori_besar"
    `);
    await queryRunner.query(`
      ALTER TABLE "transactions"
        ADD COLUMN IF NOT EXISTS "amount" DECIMAL(12,2),
        ADD COLUMN IF NOT EXISTS "merchant" VARCHAR,
        ADD COLUMN IF NOT EXISTS "category" VARCHAR,
        ADD COLUMN IF NOT EXISTS "subcategory" VARCHAR,
        ADD COLUMN IF NOT EXISTS "anomaly_score" INTEGER DEFAULT 0
    `);

    // Revert users
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "id_user",
        DROP COLUMN IF EXISTS "persona",
        DROP COLUMN IF EXISTS "current_wants_ratio",
        DROP COLUMN IF EXISTS "current_needs_ratio"
    `);
  }
}
