"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCreatedAtToParticipant1755522057502 = void 0;
class AddCreatedAtToParticipant1755522057502 {
    constructor() {
        this.name = 'AddCreatedAtToParticipant1755522057502';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE participant 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE participant 
            DROP COLUMN created_at
        `);
    }
}
exports.AddCreatedAtToParticipant1755522057502 = AddCreatedAtToParticipant1755522057502;
//# sourceMappingURL=1755522057502-AddCreatedAtToParticipant.js.map