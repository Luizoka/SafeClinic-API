import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDoctorSpeciality1716562800000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the column already exists
        const table = await queryRunner.getTable("doctors");
        const specialityColumn = table?.findColumnByName("speciality");

        if (!specialityColumn) {
            // 1. Add the column as nullable initially
            await queryRunner.query(`ALTER TABLE "doctors" ADD "speciality" character varying(100)`);
            
            // 2. Update existing records with a default value
            await queryRunner.query(`UPDATE "doctors" SET "speciality" = 'Medicina Geral' WHERE "speciality" IS NULL`);
            
            // 3. Add NOT NULL constraint after all records have a value
            await queryRunner.query(`ALTER TABLE "doctors" ALTER COLUMN "speciality" SET NOT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Make the column nullable first to avoid constraint violations
        await queryRunner.query(`ALTER TABLE "doctors" ALTER COLUMN "speciality" DROP NOT NULL`);
        
        // Then drop the column
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "speciality"`);
    }
}
