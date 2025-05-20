    -- Criando as extensões necessárias
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Criando os tipos ENUM
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'receptionist');
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'absent');
    CREATE TYPE appointment_type AS ENUM ('online', 'presential');
    CREATE TYPE work_shift AS ENUM ('morning', 'afternoon', 'night');

    -- Tabela de Usuários (principal)
    CREATE TABLE users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        name VARCHAR(255) NOT NULL,
        cpf VARCHAR(11) UNIQUE NOT NULL,
        phone VARCHAR(20),
        status BOOLEAN DEFAULT true,
        two_factor_enabled BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Pacientes
    CREATE TABLE patients (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        birth_date DATE NOT NULL,
        health_insurance VARCHAR(255),
        emergency_contact VARCHAR(255),
        blood_type VARCHAR(5),
        allergies TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Especialidades
    CREATE TABLE specialities (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
    );

    -- Tabela de Médicos
    CREATE TABLE doctors (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        crm VARCHAR(20) UNIQUE NOT NULL,
        speciality_id UUID REFERENCES specialities(id) NOT NULL,
        professional_statement TEXT,
        consultation_duration INTEGER DEFAULT 30, -- em minutos
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Recepcionistas
    CREATE TABLE receptionists (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        work_shift work_shift NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Consultas
    CREATE TABLE appointments (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
        appointment_datetime TIMESTAMP NOT NULL,
        status appointment_status DEFAULT 'scheduled',
        type appointment_type NOT NULL,
        symptoms_description TEXT,
        medical_notes TEXT,
        cancellation_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Horários dos Médicos
    CREATE TABLE doctor_schedules (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_time_range CHECK (start_time < end_time)
    );

    -- Tabela de Bloqueios de Horário
    CREATE TABLE blocked_times (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
        start_datetime TIMESTAMP NOT NULL,
        end_datetime TIMESTAMP NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_datetime_range CHECK (start_datetime < end_datetime)
    );

    -- Tabela de Notificações
    CREATE TABLE notifications (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices para melhorar performance
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_cpf ON users(cpf);
    CREATE INDEX idx_appointments_datetime ON appointments(appointment_datetime);
    CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
    CREATE INDEX idx_appointments_patient ON appointments(patient_id);
    CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);

    -- Trigger para atualizar updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Aplicando o trigger em todas as tabelas que têm updated_at
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_patients_updated_at
        BEFORE UPDATE ON patients
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_doctors_updated_at
        BEFORE UPDATE ON doctors
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_receptionists_updated_at
        BEFORE UPDATE ON receptionists
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_doctor_schedules_updated_at
        BEFORE UPDATE ON doctor_schedules
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_blocked_times_updated_at
        BEFORE UPDATE ON blocked_times
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_appointments_updated_at
        BEFORE UPDATE ON appointments
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Comentários nas tabelas
    COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema';
    COMMENT ON TABLE patients IS 'Informações específicas dos pacientes';
    COMMENT ON TABLE doctors IS 'Informações específicas dos médicos';
    COMMENT ON TABLE receptionists IS 'Informações específicas dos recepcionistas';
    COMMENT ON TABLE doctor_schedules IS 'Horários regulares de atendimento dos médicos';
    COMMENT ON TABLE blocked_times IS 'Períodos bloqueados na agenda dos médicos';
    COMMENT ON TABLE appointments IS 'Agendamentos de consultas';
    COMMENT ON TABLE notifications IS 'Notificações do sistema para os usuários';
    COMMENT ON TABLE specialities IS 'Tabela de especialidades médicas';