import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1775133435297 implements MigrationInterface {
    name = ' $npmConfigName1775133435297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "title" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "title" DROP DEFAULT`);
    }

}
