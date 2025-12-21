/*
  # Add Confidence Tracking to Assessment System

  1. New Tables
    - `assessment_responses` - Track student answers with confidence levels
    - `lab_sessions` - Track real-time lab activities
    
  2. Security
    - Enable RLS on new tables
    - Add policies for proper access control
    
  3. Analytics
    - Admin can view confidence levels for each answer
    - Track lab performance and attack success rates
*/

-- Create assessment responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  selected_answer integer NOT NULL,
  confidence_level integer NOT NULL CHECK (confidence_level >= 1 AND confidence_level <= 5),
  is_correct boolean NOT NULL,
  time_taken_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create lab sessions table
CREATE TABLE IF NOT EXISTS lab_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  lab_id text NOT NULL,
  session_data jsonb DEFAULT '{}',
  objectives_completed text[] DEFAULT '{}',
  attacks_performed jsonb DEFAULT '{}',
  vulnerabilities_found text[] DEFAULT '{}',
  completion_percentage integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_sessions ENABLE ROW LEVEL SECURITY;

-- Assessment responses policies
CREATE POLICY "Users can insert their own responses"
  ON assessment_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own responses"
  ON assessment_responses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all responses"
  ON assessment_responses
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Lab sessions policies
CREATE POLICY "Users can manage their own lab sessions"
  ON lab_sessions
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all lab sessions"
  ON lab_sessions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assessment_responses_user_id ON assessment_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_question_id ON assessment_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_user_id ON lab_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_lab_id ON lab_sessions(lab_id);

-- Update trigger for lab sessions
CREATE TRIGGER update_lab_sessions_updated_at
    BEFORE UPDATE ON lab_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();