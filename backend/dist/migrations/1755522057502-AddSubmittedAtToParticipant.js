"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSubmittedAtToParticipant1755522057502 = void 0;
class AddSubmittedAtToParticipant1755522057502 {
    constructor() {
        this.name = 'AddSubmittedAtToParticipant1755522057502';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE participant 
            ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE participant 
            DROP COLUMN submitted_at
        `);
    }
}
exports.AddSubmittedAtToParticipant1755522057502 = AddSubmittedAtToParticipant1755522057502;
//# sourceMappingURL=1755522057502-AddSubmittedAtToParticipant.js.map