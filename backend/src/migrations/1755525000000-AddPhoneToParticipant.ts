import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneToParticipant1755525000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE participant 
      ADD COLUMN phone VARCHAR(255) NOT NULL DEFAULT '';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE participant 
      DROP COLUMN phone;
    `);
  }
}