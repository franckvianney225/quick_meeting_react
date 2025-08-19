"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProfileFieldsToUser1755523000000 = void 0;
class AddProfileFieldsToUser1755523000000 {
    constructor() {
        this.name = 'AddProfileFieldsToUser1755523000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN phone VARCHAR(20) NULL,
            ADD COLUMN department VARCHAR(100) NULL,
            ADD COLUMN position VARCHAR(100) NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN phone,
            DROP COLUMN department,
            DROP COLUMN position
        `);
    }
}
exports.AddProfileFieldsToUser1755523000000 = AddProfileFieldsToUser1755523000000;
//# sourceMappingURL=1755523000000-AddProfileFieldsToUser.js.map