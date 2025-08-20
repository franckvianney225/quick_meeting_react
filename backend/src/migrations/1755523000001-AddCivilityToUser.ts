import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCivilityToUser1755523000001 implements MigrationInterface {
    name = 'AddCivilityToUser1755523000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN civility VARCHAR(10) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN civility
        `);
    }
}