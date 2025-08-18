import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubmittedAtToParticipant1755522057502 implements MigrationInterface {
    name = 'AddSubmittedAtToParticipant1755522057502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE participant 
            ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE participant 
            DROP COLUMN submitted_at
        `);
    }
}