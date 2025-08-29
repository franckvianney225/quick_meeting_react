import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class FixStartDateColumn1756500000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
