-- Auth.js integration schema updates
ALTER TABLE user ADD COLUMN name text;
--> statement-breakpoint
ALTER TABLE user ADD COLUMN email_verified integer;
--> statement-breakpoint
ALTER TABLE user ADD COLUMN image text;
--> statement-breakpoint
ALTER TABLE user ADD COLUMN updated_at integer NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000);
--> statement-breakpoint
UPDATE user SET updated_at = created_at WHERE updated_at IS NULL OR updated_at = 0;

--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS user_email_unique ON user(email);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS user_username_unique ON user(username);

--> statement-breakpoint
DROP TABLE IF EXISTS session;
--> statement-breakpoint
CREATE TABLE session (
    session_token text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    expires integer NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX session_user_id_idx ON session(user_id);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS account (
    user_id text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    PRIMARY KEY (provider, provider_account_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX account_user_id_idx ON account(user_id);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS verification_token (
    identifier text NOT NULL,
    token text PRIMARY KEY NOT NULL,
    expires integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX verification_token_identifier_idx ON verification_token(identifier);
