/*
  # Fix Row Level Security Policies

  1. Security Updates
    - Fix users table RLS policies to allow registration
    - Allow anonymous users to create accounts
    - Allow users to read their own data after authentication
    - Fix authentication flow issues

  2. Policy Changes
    - Enable anonymous user registration
    - Proper user data access controls
    - Fix login/registration workflow
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;

-- Create new, properly configured policies for users table

-- Allow anonymous users to register (insert new users)
CREATE POLICY "Allow anonymous user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Allow service role to read all users (for admin functions)
CREATE POLICY "Service role can read all users"
  ON users
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to manage all users (for admin functions)
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update admin_content policies to work with the new auth system
DROP POLICY IF EXISTS "Anyone can read published content" ON admin_content;
DROP POLICY IF EXISTS "Admins can manage their content" ON admin_content;
DROP POLICY IF EXISTS "Admins can insert content" ON admin_content;

-- Allow anyone to read published content
CREATE POLICY "Anyone can read published content"
  ON admin_content
  FOR SELECT
  USING (is_published = true);

-- Allow content creators to manage their own content
CREATE POLICY "Content creators can manage their content"
  ON admin_content
  FOR ALL
  TO authenticated
  USING (admin_id::text = auth.uid()::text)
  WITH CHECK (admin_id::text = auth.uid()::text);

-- Allow service role to manage all content (for admin oversight)
CREATE POLICY "Service role can manage all content"
  ON admin_content
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update notes policies
DROP POLICY IF EXISTS "Anyone can read notes" ON notes;
DROP POLICY IF EXISTS "Admins can manage notes" ON notes;
DROP POLICY IF EXISTS "Admins can insert notes" ON notes;

-- Allow anyone to read notes
CREATE POLICY "Anyone can read notes"
  ON notes
  FOR SELECT
  USING (true);

-- Allow note creators to manage their notes
CREATE POLICY "Note creators can manage notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (admin_id::text = auth.uid()::text)
  WITH CHECK (admin_id::text = auth.uid()::text);

-- Allow service role to manage all notes
CREATE POLICY "Service role can manage all notes"
  ON notes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);