-- Wings Fly Aviation Academy - Supabase Setup Script

-- 1. Site Config Table (For Chairman Info, Phone, Address)
CREATE TABLE IF NOT EXISTS public.site_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site config values
INSERT INTO public.site_config (key, value) VALUES 
('phone', '+8801782202433'),
('address', 'এ৭, এ৮ বনশ্রী মেইন রোড, ঢাকা ১২১৯'),
('chairman_message', 'আমাদের একাডেমিতে আপনাকে স্বাগতম।'),
('chairman_name', 'ফেরদৌস আহমেদ'),
('chairman_designation', 'চেয়ারম্যান, উইংস ফ্লাই অ্যাভিয়েশন একাডেমি'),
('chairman_image', 'https://wingsflyaviationacademy.com/wp-content/uploads/2024/04/chairman.webp')
ON CONFLICT (key) DO NOTHING;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price VARCHAR(100),
    description TEXT,
    image_url TEXT,
    duration VARCHAR(50),
    level VARCHAR(50),
    badge VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Instructors Table
CREATE TABLE IF NOT EXISTS public.instructors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Gallery Items Table
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enrollments Table (If not already created)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    course VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Payments Table (If not already created)
CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    amount VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security (RLS) for easy Admin Panel access (for development phase)
ALTER TABLE public.site_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Note: You must manually create a Storage Bucket named 'wingsfly-gallery' and set it to 'Public'.
