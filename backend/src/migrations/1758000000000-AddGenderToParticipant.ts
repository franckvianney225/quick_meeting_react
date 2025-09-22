import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGenderToParticipant1758000000000 implements MigrationInterface {
    name = 'AddGenderToParticipant1758000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Vérifier si la colonne gender existe déjà
        const table = await queryRunner.getTable('participant');
        const genderColumn = table.columns.find(column => column.name === 'gender');
        
        if (!genderColumn) {
            await queryRunner.query(`ALTER TABLE "participant" ADD "gender" character varying(10)`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('participant');
        const genderColumn = table.columns.find(column => column.name === 'gender');
        
        if (genderColumn) {
            await queryRunner.query(`ALTER TABLE "participant" DROP COLUMN "gender"`);
        }
    }
}