"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixStartDateColumn1756500000000 = void 0;
class FixStartDateColumn1756500000000 {
    async up(queryRunner) {
        const table = await queryRunner.getTable('meeting');
        const startDateColumn = table?.findColumnByName('start_date');
        if (!startDateColumn) {
            await queryRunner.query(`
        ALTER TABLE "meeting"
        ADD "start_date" TIMESTAMP NOT NULL DEFAULT NOW();
      `);
            await queryRunner.query(`
        ALTER TABLE "meeting"
        ALTER COLUMN "start_date" DROP DEFAULT;
      `);
        }
        else {
            await queryRunner.query(`
        DELETE FROM "meeting";
      `);
            await queryRunner.query(`
        ALTER TABLE "meeting"
        ALTER COLUMN "start_date" SET NOT NULL;
      `);
        }
        const meetingEndDateColumn = table?.findColumnByName('meeting_end_date');
        if (!meetingEndDateColumn) {
            await queryRunner.query(`
        ALTER TABLE "meeting"
        ADD "meeting_end_date" TIMESTAMP NULL;
      `);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "meeting"
      DROP COLUMN IF EXISTS "meeting_end_date";
    `);
        await queryRunner.query(`
      ALTER TABLE "meeting" 
      DROP COLUMN IF EXISTS "start_date";
    `);
    }
}
exports.FixStartDateColumn1756500000000 = FixStartDateColumn1756500000000;
//# sourceMappingURL=1756500000000-FixStartDateColumn.js.map