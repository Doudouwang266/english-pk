-- Create enum types
CREATE TYPE room_status AS ENUM ('waiting', 'countdown', 'playing', 'finished');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Rooms table
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

-- Room players
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

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

-- Players can read rooms they belong to
CREATE POLICY "read_member_rooms" ON rooms
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM room_players
            WHERE room_players.room_id = rooms.id
            AND room_players.user_id = auth.uid()
        )
    );

-- Players can read room_players in their rooms
CREATE POLICY "read_room_players" ON room_players
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM room_players AS rp
            WHERE rp.room_id = room_players.room_id
            AND rp.user_id = auth.uid()
        )
    );

-- Function to add player score atomically
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
