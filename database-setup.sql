-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    medical_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create emergency_reports table
CREATE TABLE IF NOT EXISTS emergency_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('security', 'medical', 'fire', 'other')) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) CHECK (status IN ('pending', 'responded', 'resolved')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('emergency', 'notification', 'response')) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_student_number ON profiles(student_number);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_user_id ON emergency_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_status ON emergency_reports(status);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create policies for emergency_reports table
CREATE POLICY "Users can view own emergency reports" ON emergency_reports
    FOR SELECT USING (user_id IN (
        SELECT id FROM profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

CREATE POLICY "Users can insert own emergency reports" ON emergency_reports
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

-- Create policies for messages table
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (user_id IN (
        SELECT id FROM profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (user_id IN (
        SELECT id FROM profiles WHERE email = current_setting('request.jwt.calls', true)::json->>'email'
    ));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_reports_updated_at BEFORE UPDATE ON emergency_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();