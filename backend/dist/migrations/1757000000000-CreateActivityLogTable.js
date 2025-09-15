"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateActivityLogTable1757000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateActivityLogTable1757000000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'activity_logs',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'type',
                    type: 'varchar',
                    length: '50',
                },
                {
                    name: 'description',
                    type: 'text',
                },
                {
                    name: 'metadata',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'userId',
                    type: 'integer',
                    isNullable: true,
                },
                {
                    name: 'meetingId',
                    type: 'integer',
                },
            ],
        }), true);
        await queryRunner.createForeignKey('activity_logs', new typeorm_1.TableForeignKey({
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'SET NULL',
        }));
        await queryRunner.createForeignKey('activity_logs', new typeorm_1.TableForeignKey({
            columnNames: ['meetingId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'meetings',
            onDelete: 'CASCADE',
        }));
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable('activity_logs');
        const foreignKeys = table.foreignKeys;
        for (const foreignKey of foreignKeys) {
            await queryRunner.dropForeignKey('activity_logs', foreignKey);
        }
        await queryRunner.dropTable('activity_logs');
    }
}
exports.CreateActivityLogTable1757000000000 = CreateActivityLogTable1757000000000;
//# sourceMappingURL=1757000000000-CreateActivityLogTable.js.map