-- Answers table: records each player's answer per round
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
CREATE INDEX IF NOT EXISTS idx_answers_user ON answers(user_id);

-- Enable RLS
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Players can read answers from their rooms
CREATE POLICY "read_room_answers" ON answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM room_players
            WHERE room_players.room_id = answers.room_id
            AND room_players.user_id = auth.uid()
        )
    );

-- Players can insert their own answers
CREATE POLICY "insert_own_answers" ON answers
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
