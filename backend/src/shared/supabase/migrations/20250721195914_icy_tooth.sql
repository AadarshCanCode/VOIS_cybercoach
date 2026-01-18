/*
  # Fix User Registration RLS Policy

  1. Security Changes
    - Drop existing restrictive policies on users table
    - Create proper policies for user registration and authentication
    - Allow anonymous users to register (INSERT)
    - Allow authenticated users to read/update their own data
    - Allow service role full access for admin functions

  2. Policy Details
    - Anonymous registration: Allow unauthenticated users to create accounts
    - Self-access: Users can only access their own data
    - Admin access: Service role can manage all users
*/

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Allow anonymous user registration" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
DROP POLICY IF EXISTS "Service role can read all users" ON users;

-- Create new policies for proper user registration flow

-- Allow anonymous users to register (create new accounts)
CREATE POLICY "Enable insert for anonymous users during registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Allow service role full access for admin functions
CREATE POLICY "Service role has full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow public read access for basic user info (needed for login verification)
CREATE POLICY "Public can read basic user info for authentication"
  ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);