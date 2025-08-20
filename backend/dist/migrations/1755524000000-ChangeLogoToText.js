"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeLogoToText1755524000000 = void 0;
class ChangeLogoToText1755524000000 {
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
exports.ChangeLogoToText1755524000000 = ChangeLogoToText1755524000000;
//# sourceMappingURL=1755524000000-ChangeLogoToText.js.map