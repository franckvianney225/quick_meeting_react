"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddGenderToParticipant1758000000000 = void 0;
class AddGenderToParticipant1758000000000 {
    constructor() {
        this.name = 'AddGenderToParticipant1758000000000';
    }
    async up(queryRunner) {
        const table = await queryRunner.getTable('participant');
        const genderColumn = table.columns.find(column => column.name === 'gender');
        if (!genderColumn) {
            await queryRunner.query(`ALTER TABLE "participant" ADD "gender" character varying(10)`);
        }
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable('participant');
        const genderColumn = table.columns.find(column => column.name === 'gender');
        if (genderColumn) {
            await queryRunner.query(`ALTER TABLE "participant" DROP COLUMN "gender"`);
        }
    }
}
exports.AddGenderToParticipant1758000000000 = AddGenderToParticipant1758000000000;
//# sourceMappingURL=1758000000000-AddGenderToParticipant.js.map