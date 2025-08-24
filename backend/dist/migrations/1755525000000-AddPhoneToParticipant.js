"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPhoneToParticipant1755525000000 = void 0;
class AddPhoneToParticipant1755525000000 {
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE participant 
      ADD COLUMN phone VARCHAR(255) NOT NULL DEFAULT '';
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE participant 
      DROP COLUMN phone;
    `);
    }
}
exports.AddPhoneToParticipant1755525000000 = AddPhoneToParticipant1755525000000;
//# sourceMappingURL=1755525000000-AddPhoneToParticipant.js.map