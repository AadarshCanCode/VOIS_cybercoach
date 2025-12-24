-- Helper function to generate UUIDs if not exists (usually in extensions but safe to have)
-- Assuming UUID extension is enabled as per schema.sql

-- Insert Courses
INSERT INTO public.courses (id, title, description, category, difficulty, is_published, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'OWASP Top 10 Security Risks', 'Complete understanding of the most critical web application security risks', 'Web Security', 'beginner', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Web Application Security Fundamentals', 'Comprehensive knowledge of web application security principles and practices', 'Web Security', 'beginner', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Certified Ethical Hacker (Prep)', 'Preparation for ethical hacking certification with hands-on experience', 'Ethical Hacking', 'intermediate', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Modules for Course 1 (OWASP)
INSERT INTO public.modules (id, title, description, content, course_id, "order", is_published, created_at, updated_at)
VALUES
    (uuid_generate_v4(), 'A01:2021 – Broken Access Control', 'Deep dive into access control failures', 'Content for broken access control...', '550e8400-e29b-41d4-a716-446655440001', 1, true, NOW(), NOW()),
    (uuid_generate_v4(), 'A02:2021 – Cryptographic Failures', 'Understanding encryption weaknesses', 'Content for crypto failures...', '550e8400-e29b-41d4-a716-446655440001', 2, true, NOW(), NOW()),
    (uuid_generate_v4(), 'A03:2021 – Injection', 'SQL, NoSQL, and Command Injection', 'Content for injection...', '550e8400-e29b-41d4-a716-446655440001', 3, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert Modules for Course 2 (Web App Sec)
INSERT INTO public.modules (id, title, description, content, course_id, "order", is_published, created_at, updated_at)
VALUES
    (uuid_generate_v4(), 'Introduction to HTTP', 'Basics of HTTP protocol', 'Content here...', '550e8400-e29b-41d4-a716-446655440002', 1, true, NOW(), NOW()),
    (uuid_generate_v4(), 'Same Origin Policy', 'Browser security models', 'Content here...', '550e8400-e29b-41d4-a716-446655440002', 2, true, NOW(), NOW())
ON CONFLICT DO NOTHING;
