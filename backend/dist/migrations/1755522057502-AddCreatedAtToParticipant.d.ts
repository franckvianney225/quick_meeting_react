import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddCreatedAtToParticipant1755522057502 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
