-- Code Written and Owned By Dominic Nguyen
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Login Table Script Created and Owned by Dominic Nguyen
CREATE TABLE login (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);

-- Login Variables Created and Owned by Dominic Nguyen
INSERT INTO login (username, email, password_hash, first_name, last_name)
VALUES (
    'example_user',
    'user@example.com',
    crypt('user_password', gen_salt('bf')),
    'John',
    'Doe'
);

-- Testing Login Script by Dominic Nguyen
SELECT * FROM login WHERE username = 'example_user';

-- Testing Login Script by Dominic Nguyen
SELECT id, username, email, first_name, last_name
FROM login
WHERE username = 'example_user'
AND password_hash = crypt('user_password', password_hash);

-- Feeding Information Script by Dominic Nguyen
CREATE TABLE feeding_information (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES login(username),
    fed BOOLEAN NOT NULL,
    amount INTEGER NOT NULL,
    feeding_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
