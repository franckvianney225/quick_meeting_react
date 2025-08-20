"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeLogoColumnType1755524000000 = void 0;
class ChangeLogoColumnType1755524000000 {
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE organization_settings 
      ALTER COLUMN logo TYPE text;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE organization_settings 
      ALTER COLUMN logo TYPE varchar(500);
    `);
    }
}
exports.ChangeLogoColumnType1755524000000 = ChangeLogoColumnType1755524000000;
//# sourceMappingURL=1755524000000-ChangeLogoColumnType.js.map