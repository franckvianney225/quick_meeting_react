import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtToParticipant1755522057502 implements MigrationInterface {
    name = 'AddCreatedAtToParticipant1755522057502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE participant 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE participant 
            DROP COLUMN created_at
        `);
    }
}
