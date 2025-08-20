"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCivilityToUser1755523000001 = void 0;
class AddCivilityToUser1755523000001 {
    constructor() {
        this.name = 'AddCivilityToUser1755523000001';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN civility VARCHAR(10) NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN civility
        `);
    }
}
exports.AddCivilityToUser1755523000001 = AddCivilityToUser1755523000001;
//# sourceMappingURL=1755523000001-AddCivilityToUser.js.map