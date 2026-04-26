-- =========================================================
-- Wings Fly Aviation Academy - Phase 4 SQL Updates
-- =========================================================

-- 1. Create Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    certificate_id VARCHAR(100) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    grade VARCHAR(50) DEFAULT 'A+',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Setup RLS (Row Level Security) for Certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to verify certificates
CREATE POLICY "Enable read access for all users on certificates"
ON certificates FOR SELECT
USING (true);

-- Allow all access for admin (in a real app, restrict by auth.uid(), but keeping simple for now)
CREATE POLICY "Enable all access for admin on certificates"
ON certificates FOR ALL
USING (true);

-- 3. Insert Dummy Data for Testing
INSERT INTO certificates (student_name, course_name, certificate_id, issue_date, grade) VALUES
('Md. Kawsar Mia', 'Professional Visa Processing', 'WF-2024-001', '2024-05-15', 'A+'),
('Lokman Sharif', 'Air Ticketing & GDS', 'WF-2024-002', '2024-06-20', 'A');
