import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1779698495162 implements MigrationInterface {
  name = 'InitSchema1779698495162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_transaction_type_enum" AS ENUM('debit', 'credit')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_main_category_enum" AS ENUM('wants', 'needs', 'savings')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "account_id" uuid, "customer_id" uuid NOT NULL, "transaction_type" "public"."transactions_transaction_type_enum" NOT NULL, "main_category" "public"."transactions_main_category_enum", "sub_category" character varying(50) NOT NULL, "amount" bigint NOT NULL, "running_balance" bigint NOT NULL DEFAULT '0', "description" character varying(200) NOT NULL DEFAULT '', "notes" character varying(500) NOT NULL DEFAULT '', "transaction_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "day_of_week" integer NOT NULL DEFAULT '0', "day_of_month" integer NOT NULL DEFAULT '0', "hour" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_transactions_customer_timestamp" ON "transactions" ("customer_id", "transaction_timestamp") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."account_status_enum" AS ENUM('active', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "account_number" character varying(50) NOT NULL, "balance" bigint NOT NULL DEFAULT '0', "status" "public"."account_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c91a92631ee1ccb9f29e599ba42" UNIQUE ("account_number"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."monthly_reports_persona_enum" AS ENUM('Tightwad', 'Unconflicted', 'Spendthrift')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."monthly_reports_prev_persona_enum" AS ENUM('Tightwad', 'Unconflicted', 'Spendthrift')`,
    );
    await queryRunner.query(
      `CREATE TABLE "monthly_reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "target_month" character(7) NOT NULL, "persona" "public"."monthly_reports_persona_enum" NOT NULL, "prev_persona" "public"."monthly_reports_prev_persona_enum", "savings_rate" numeric(6,4) NOT NULL, "wants_ratio" numeric(5,4) NOT NULL, "needs_ratio" numeric(5,4) NOT NULL, "wants_amount" bigint NOT NULL, "needs_amount" bigint NOT NULL, "savings_amount" bigint NOT NULL, "behavioral_features" jsonb, "report_text" text NOT NULL, "generated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "uq_monthly_customer_month" UNIQUE ("customer_id", "target_month"), CONSTRAINT "PK_6d42f2bb59ee092e3349e2b8992" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_monthly_reports_customer_month" ON "monthly_reports" ("customer_id", "target_month") `,
    );
    await queryRunner.query(
      `CREATE TABLE "detected_anomalies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transaction_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "weekly_report_id" uuid NOT NULL, "sub_category" character varying(50) NOT NULL, "amount" bigint NOT NULL, "mae" double precision NOT NULL, "threshold_val" double precision NOT NULL, "ratio" double precision NOT NULL, "anomaly_context" text, "detected_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ad97ef70106e628aed52bf13777" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_anomalies_customer" ON "detected_anomalies" ("customer_id", "detected_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_credentials_status_enum" AS ENUM('active', 'locked', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_credentials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "username" character varying(20) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "mpin" character(6), "active_token" text, "status" "public"."user_credentials_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "UQ_3e6479bc08bff186fa487295770" UNIQUE ("username"), CONSTRAINT "UQ_8e125b82911b4715b635dcf2fda" UNIQUE ("email"), CONSTRAINT "REL_7aa1b59180a9afaf2b05bd7cec" UNIQUE ("customer_id"), CONSTRAINT "PK_5cadc04d03e2d9fe76e1b44eb34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying NOT NULL, "date_of_birth" date, "mothers_maiden_name" character varying, "demographic_segment" character varying, "monthly_income" numeric(15,2) DEFAULT '0', "savings_goal" numeric(15,2) DEFAULT '0', "base_persona" character varying, "is_dynamic" boolean NOT NULL DEFAULT false, "current_wants_ratio" numeric(5,4) DEFAULT '0', "current_needs_ratio" numeric(5,4) DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "weekly_reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "report_date" date NOT NULL, "period_start" date NOT NULL, "persona" character varying(50) NOT NULL, "wants_ratio" numeric(5,4) NOT NULL, "needs_ratio" numeric(5,4) NOT NULL, "total_expenses" bigint NOT NULL, "anomaly_count" integer NOT NULL DEFAULT '0', "report_text" text NOT NULL, "generated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "uq_weekly_customer_date" UNIQUE ("customer_id", "report_date"), CONSTRAINT "PK_1a8cd4b8d43d7a359597b75f792" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_weekly_reports_customer_date" ON "weekly_reports" ("customer_id", "report_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6f09843c214f21a462b54b11e8d" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD CONSTRAINT "FK_977b5abdf1370566eaade16eaa9" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "monthly_reports" ADD CONSTRAINT "FK_e1230555c00c1977fbd1ea3207c" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" ADD CONSTRAINT "FK_5bc5eaae811809682dfcb14365e" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" ADD CONSTRAINT "FK_14efc3b9c02870893d7d5c01988" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" ADD CONSTRAINT "FK_ada924a90578636b9ff5606936f" FOREIGN KEY ("weekly_report_id") REFERENCES "weekly_reports"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_credentials" ADD CONSTRAINT "FK_7aa1b59180a9afaf2b05bd7cec7" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "weekly_reports" ADD CONSTRAINT "FK_fb66d9901d4b613c3017e779ae4" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "weekly_reports" DROP CONSTRAINT "FK_fb66d9901d4b613c3017e779ae4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_credentials" DROP CONSTRAINT "FK_7aa1b59180a9afaf2b05bd7cec7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" DROP CONSTRAINT "FK_ada924a90578636b9ff5606936f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" DROP CONSTRAINT "FK_14efc3b9c02870893d7d5c01988"`,
    );
    await queryRunner.query(
      `ALTER TABLE "detected_anomalies" DROP CONSTRAINT "FK_5bc5eaae811809682dfcb14365e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "monthly_reports" DROP CONSTRAINT "FK_e1230555c00c1977fbd1ea3207c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" DROP CONSTRAINT "FK_977b5abdf1370566eaade16eaa9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6f09843c214f21a462b54b11e8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_weekly_reports_customer_date"`,
    );
    await queryRunner.query(`DROP TABLE "weekly_reports"`);
    await queryRunner.query(`DROP TABLE "customer"`);
    await queryRunner.query(`DROP TABLE "user_credentials"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_credentials_status_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_anomalies_customer"`);
    await queryRunner.query(`DROP TABLE "detected_anomalies"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_monthly_reports_customer_month"`,
    );
    await queryRunner.query(`DROP TABLE "monthly_reports"`);
    await queryRunner.query(
      `DROP TYPE "public"."monthly_reports_prev_persona_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."monthly_reports_persona_enum"`,
    );
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`DROP TYPE "public"."account_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_transactions_customer_timestamp"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."transactions_main_category_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."transactions_transaction_type_enum"`,
    );
  }
}
