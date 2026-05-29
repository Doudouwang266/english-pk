-- Create question type enum
CREATE TYPE question_type AS ENUM (
    'vocabulary',
    'grammar',
    'translation',
    'synonym',
    'reading',
    'listening'
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type          question_type NOT NULL,
    difficulty    difficulty_level NOT NULL,
    stem          TEXT NOT NULL,
    media_url     TEXT,
    options       JSONB NOT NULL,
    correct_index SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
    explanation   TEXT,
    time_limit_ms INT DEFAULT 15000,
    tags          TEXT[] DEFAULT '{}',
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read questions
CREATE POLICY "read_questions" ON questions
    FOR SELECT
    USING (auth.role() = 'authenticated');
