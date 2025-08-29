"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMeetingStartEndDates1756501000000 = void 0;
class AddMeetingStartEndDates1756501000000 {
    constructor() {
        this.name = 'AddMeetingStartEndDates1756501000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "meeting" 
            ADD COLUMN "meeting_start_date" TIMESTAMP,
            ADD COLUMN "meeting_end_date" TIMESTAMP
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "meeting" 
            DROP COLUMN "meeting_start_date",
            DROP COLUMN "meeting_end_date"
        `);
    }
}
exports.AddMeetingStartEndDates1756501000000 = AddMeetingStartEndDates1756501000000;
//# sourceMappingURL=1756501000000-AddMeetingStartEndDates.js.map