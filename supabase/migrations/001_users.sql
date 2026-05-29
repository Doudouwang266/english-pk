-- Users table: stores WeChat user profiles
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wechat_openid TEXT UNIQUE NOT NULL,
    nickname      TEXT NOT NULL,
    avatar_url    TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_openid ON users(wechat_openid);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "read_own_profile" ON users
    FOR SELECT
    USING (id = auth.uid());

-- Users can read other users' basic profiles (for display in game)
CREATE POLICY "read_public_profiles" ON users
    FOR SELECT
    USING (auth.role() = 'authenticated');
