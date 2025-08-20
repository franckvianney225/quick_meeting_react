import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLogoToText1755524000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE organization_settings 
      ALTER COLUMN logo TYPE text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE organization_settings 
      ALTER COLUMN logo TYPE varchar(500);
    `);
  }
}