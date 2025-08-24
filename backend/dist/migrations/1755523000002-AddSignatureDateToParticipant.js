"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSignatureDateToParticipant1755523000002 = void 0;
class AddSignatureDateToParticipant1755523000002 {
    constructor() {
        this.name = 'AddSignatureDateToParticipant1755523000002';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE participant 
            ADD COLUMN signature_date TIMESTAMP WITH TIME ZONE
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE participant 
            DROP COLUMN signature_date
        `);
    }
}
exports.AddSignatureDateToParticipant1755523000002 = AddSignatureDateToParticipant1755523000002;
//# sourceMappingURL=1755523000002-AddSignatureDateToParticipant.js.map