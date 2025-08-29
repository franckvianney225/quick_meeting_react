import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMeetingStartEndDates1756501000000 implements MigrationInterface {
    name = 'AddMeetingStartEndDates1756501000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "meeting" 
            ADD COLUMN "meeting_start_date" TIMESTAMP,
            ADD COLUMN "meeting_end_date" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "meeting" 
            DROP COLUMN "meeting_start_date",
            DROP COLUMN "meeting_end_date"
        `);
    }
}