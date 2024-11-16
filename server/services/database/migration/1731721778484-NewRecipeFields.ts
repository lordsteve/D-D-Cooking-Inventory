import { MigrationInterface, QueryRunner } from "typeorm";

export class NewRecipeFields1731721778484 implements MigrationInterface {
    name = 'NewRecipeFields1731721778484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`recipe\` ADD \`skillCheck\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`recipe\` ADD \`benefits\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`recipe\` ADD \`downside\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`recipe\` ADD \`isHidden\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`recipe\` DROP COLUMN \`isHidden\``);
        await queryRunner.query(`ALTER TABLE \`recipe\` DROP COLUMN \`downside\``);
        await queryRunner.query(`ALTER TABLE \`recipe\` DROP COLUMN \`benefits\``);
        await queryRunner.query(`ALTER TABLE \`recipe\` DROP COLUMN \`skillCheck\``);
    }

}
