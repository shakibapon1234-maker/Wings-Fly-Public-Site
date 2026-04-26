-- ==========================================
-- WINGS FLY AVIATION ACADEMY - PHASE 2 SQL
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create Success Stories Table
CREATE TABLE IF NOT EXISTS success_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    achievement TEXT NOT NULL,
    batch VARCHAR(100) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Turn off Row Level Security (RLS) for testing/public access
ALTER TABLE success_stories DISABLE ROW LEVEL SECURITY;

-- Insert some dummy data to start
INSERT INTO success_stories (name, achievement, batch, image_url) VALUES 
('Kawsar Mia', 'To become a Business Owner - JABAL-E-NOOR TOURS & TRAVELS after completing the Professional Visa Processing Course', 'BATCH : 2', 'https://wingsflyaviationacademy.com/wp-content/uploads/2024/11/student-1.webp'),
('Md Lokman Sharif', 'To become a Business Owner - Budget Trip after completing the Professional Visa Processing Course', 'BATCH : 2', 'https://wingsflyaviationacademy.com/wp-content/uploads/2024/11/student-2.webp');


-- 2. Add new columns to existing 'courses' table for the Details Modal
ALTER TABLE courses ADD COLUMN IF NOT EXISTS syllabus TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(255) DEFAULT 'প্রফেশনাল';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_type VARCHAR(255) DEFAULT 'আন্তর্জাতিক মানের সার্টিফিকেট';
