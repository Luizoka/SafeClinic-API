-- Script para resolver conflitos no banco SafeClinic
-- Execute este script no seu banco PostgreSQL antes de reiniciar o servidor

-- Remover enum existente se houver conflito
DROP TYPE IF EXISTS "public"."appointments_status_enum" CASCADE;
DROP TYPE IF EXISTS "public"."appointments_type_enum" CASCADE;
DROP TYPE IF EXISTS "public"."users_role_enum" CASCADE;
DROP TYPE IF EXISTS "public"."users_status_enum" CASCADE;
DROP TYPE IF EXISTS "public"."receptionist_work_shift_enum" CASCADE;

-- Remover tabelas existentes (se necessário)
DROP TABLE IF EXISTS "appointments" CASCADE;
DROP TABLE IF EXISTS "patients" CASCADE;
DROP TABLE IF EXISTS "doctors" CASCADE;
DROP TABLE IF EXISTS "receptionists" CASCADE;
DROP TABLE IF EXISTS "blocked_times" CASCADE;
DROP TABLE IF EXISTS "doctor_schedules" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Limpar possíveis sequências órfãs
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS patients_id_seq CASCADE;
DROP SEQUENCE IF EXISTS doctors_id_seq CASCADE;
DROP SEQUENCE IF EXISTS appointments_id_seq CASCADE;

-- Confirmar limpeza
SELECT 'Banco limpo com sucesso! Agora você pode reiniciar o servidor.' as status; 