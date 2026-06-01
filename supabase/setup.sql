-- ============================================================
-- English PK - Complete Database Setup
-- 将整个文件复制到 Supabase SQL Editor 一次性执行即可
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wechat_openid TEXT UNIQUE NOT NULL,
    nickname      TEXT NOT NULL,
    avatar_url    TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(wechat_openid);

-- 2. ENUM TYPES (safe re-run)
DO $$ BEGIN
    CREATE TYPE room_status AS ENUM ('waiting', 'countdown', 'playing', 'finished');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM (
        'vocabulary', 'grammar', 'translation',
        'synonym', 'reading', 'listening'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. ROOMS TABLE
CREATE TABLE IF NOT EXISTS rooms (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code       CHAR(6) UNIQUE NOT NULL,
    host_user_id      UUID NOT NULL REFERENCES users(id),
    status            room_status DEFAULT 'waiting',
    difficulty        difficulty_level NOT NULL,
    question_ids      UUID[] NOT NULL,
    current_round     SMALLINT DEFAULT 0,
    round_started_at  TIMESTAMPTZ,
    round_ends_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT now(),
    finished_at       TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_invite_code ON rooms(invite_code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- 4. ROOM PLAYERS
CREATE TABLE IF NOT EXISTS room_players (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id),
    score      INT DEFAULT 0,
    total_response_time_ms INT DEFAULT 0,
    joined_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(room_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);

-- 5. QUESTIONS TABLE
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

-- 6. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS answers (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id          UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id          UUID NOT NULL REFERENCES users(id),
    question_id      UUID NOT NULL REFERENCES questions(id),
    round_number     SMALLINT NOT NULL,
    selected_index   SMALLINT,
    is_correct       BOOLEAN NOT NULL,
    response_time_ms INT,
    points_earned    INT DEFAULT 0,
    answered_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(room_id, user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_answers_room ON answers(room_id);

-- 7. SCORE FUNCTION
CREATE OR REPLACE FUNCTION add_player_score(
    p_room_id UUID,
    p_user_id UUID,
    p_score INT,
    p_response_time_ms INT
) RETURNS void AS $$
BEGIN
    UPDATE room_players
    SET
        score = score + p_score,
        total_response_time_ms = total_response_time_ms + p_response_time_ms
    WHERE room_id = p_room_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 8. ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-run)
DO $$ BEGIN
    DROP POLICY IF EXISTS "read_own_profile" ON users;
    DROP POLICY IF EXISTS "read_public_profiles" ON users;
    DROP POLICY IF EXISTS "read_member_rooms" ON rooms;
    DROP POLICY IF EXISTS "read_room_players" ON room_players;
    DROP POLICY IF EXISTS "read_questions" ON questions;
    DROP POLICY IF EXISTS "read_room_answers" ON answers;
    DROP POLICY IF EXISTS "insert_own_answers" ON answers;
END $$;

CREATE POLICY "read_public_profiles" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "read_member_rooms" ON rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_players
            WHERE room_players.room_id = rooms.id
            AND room_players.user_id = auth.uid()
        )
    );

CREATE POLICY "read_room_players" ON room_players
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_players AS rp
            WHERE rp.room_id = room_players.room_id
            AND rp.user_id = auth.uid()
        )
    );

CREATE POLICY "read_questions" ON questions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "read_room_answers" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_players
            WHERE room_players.room_id = answers.room_id
            AND room_players.user_id = auth.uid()
        )
    );

CREATE POLICY "insert_own_answers" ON answers
    FOR INSERT WITH CHECK (user_id = auth.uid());
