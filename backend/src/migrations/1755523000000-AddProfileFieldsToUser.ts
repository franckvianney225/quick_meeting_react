import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileFieldsToUser1755523000000 implements MigrationInterface {
    name = 'AddProfileFieldsToUser1755523000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN phone VARCHAR(20) NULL,
            ADD COLUMN department VARCHAR(100) NULL,
            ADD COLUMN position VARCHAR(100) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN phone,
            DROP COLUMN department,
            DROP COLUMN position
        `);
    }
}