const { Client } = require('pg');
require('dotenv').config();

async function clearDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao banco de dados...');

    // Comandos para limpar conflitos
    const commands = [
      'DROP TYPE IF EXISTS "public"."appointments_status_enum" CASCADE;',
      'DROP TYPE IF EXISTS "public"."appointments_type_enum" CASCADE;',
      'DROP TYPE IF EXISTS "public"."users_role_enum" CASCADE;',
      'DROP TYPE IF EXISTS "public"."users_status_enum" CASCADE;',
      'DROP TYPE IF EXISTS "public"."receptionist_work_shift_enum" CASCADE;',
      'DROP TABLE IF EXISTS "appointments" CASCADE;',
      'DROP TABLE IF EXISTS "patients" CASCADE;',
      'DROP TABLE IF EXISTS "doctors" CASCADE;',
      'DROP TABLE IF EXISTS "receptionists" CASCADE;',
      'DROP TABLE IF EXISTS "blocked_times" CASCADE;',
      'DROP TABLE IF EXISTS "doctor_schedules" CASCADE;',
      'DROP TABLE IF EXISTS "notifications" CASCADE;',
      'DROP TABLE IF EXISTS "users" CASCADE;'
    ];

    console.log('🧹 Limpando banco de dados...');
    
    for (const command of commands) {
      try {
        await client.query(command);
        console.log(`✅ Executado: ${command.substring(0, 50)}...`);
      } catch (error) {
        console.log(`⚠️  Comando ignorado (já limpo): ${command.substring(0, 50)}...`);
      }
    }

    console.log('✨ Banco de dados limpo com sucesso!');
    console.log('🚀 Agora você pode reiniciar o servidor com "npm run dev"');
    
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error.message);
  } finally {
    await client.end();
  }
}

clearDatabase(); 