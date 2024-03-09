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

-- Feeding Information Script by Dominic Nguyen (Use Case #2)
CREATE TABLE feeding_information (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES login(username),
    fed BOOLEAN NOT NULL,
    amount INTEGER NOT NULL,
    feeding_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feeding Requests Table (for Use Case #1): Dominic Nguyen
CREATE TABLE feeding_requests (
    request_id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES login(username),
    requested_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending'
);

-- Daily Consumption Table (for USE CASE 3): Dominic Nguyen
CREATE TABLE daily_consumption (
    tracking_id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES login(username),
    tracking_date DATE DEFAULT CURRENT_DATE,
    consumed_amount INTEGER NOT NULL
);

-- Pause ID (for USE CASE #4): Dominic Nguyen
CREATE TABLE service_pause (
    pause_id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES login(username),
    pause_status BOOLEAN DEFAULT FALSE -- False: Active, True: Paused
);


-- Camera Monitoring (for USE CASE #5): Dominic Nguyen
CREATE TABLE camera_monitoring (
    monitoring_id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES login(username),
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    camera_link TEXT -- Link to the camera image or video
);

