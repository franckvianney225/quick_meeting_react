import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateActivityLogTable1757000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'activity_logs',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'activity_logs',
      new TableForeignKey({
        columnNames: ['meetingId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'meetings',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('activity_logs');
    const foreignKeys = table.foreignKeys;
    
    for (const foreignKey of foreignKeys) {
      await queryRunner.dropForeignKey('activity_logs', foreignKey);
    }
    
    await queryRunner.dropTable('activity_logs');
  }
}