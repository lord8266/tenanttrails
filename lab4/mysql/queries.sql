
DROP DATABASE IF EXISTS tenanttrails;
CREATE DATABASE tenanttrails;
USE tenanttrails;

CREATE TABLE apartments (
  id            INT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  address       VARCHAR(200) NOT NULL,
  neighbourhood VARCHAR(80)  NOT NULL,
  landlord      VARCHAR(120),
  units         INT,
  built         INT
);

CREATE TABLE users (
  id       INT PRIMARY KEY,
  name     VARCHAR(120) NOT NULL,
  email    VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  initials VARCHAR(5)
);

CREATE TABLE reviews (
  id      INT PRIMARY KEY,
  apt_id  INT     NOT NULL,
  user_id INT     NOT NULL,
  rating  TINYINT NOT NULL,
  body    TEXT    NOT NULL,
  created DATE    NOT NULL,
  FOREIGN KEY (apt_id)  REFERENCES apartments(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id        INT PRIMARY KEY,
  review_id INT  NOT NULL,
  user_id   INT  NOT NULL,
  body      TEXT NOT NULL,
  created   DATE NOT NULL,
  FOREIGN KEY (review_id) REFERENCES reviews(id),
  FOREIGN KEY (user_id)   REFERENCES users(id)
);

-- ---------------------------------------------------------------------
-- Data (from the lab slides)
-- ---------------------------------------------------------------------

INSERT INTO apartments (id, name, address, neighbourhood, landlord, units, built) VALUES
  (2, 'Le Marchant Towers', '1585 Le Marchant St', 'West End',  'Killam Properties',    88,  1975),
  (3, 'Fenwick Tower',      '5599 Fenwick St',     'Downtown',  'Templeton Properties', 314, 1971),
  (4, 'Park Victoria',      '1496 Carlton St',     'South End', 'Southwest Properties', 60,  2015);

INSERT INTO users (id, name, email, password, initials) VALUES
  (1, 'Alex Mitchell', 'alex@dal.ca',       'password123', 'AM'),
  (2, 'James Chen',    'james@example.com', 'pass',        'JC');

INSERT INTO reviews (id, apt_id, user_id, rating, body, created) VALUES
  (5,  2, 2, 4, 'Responsive management, though parking is a five-month wait.', '2026-04-02'),
  (8,  3, 1, 4, 'Incredible 28th-floor view; elevators break down often.',    '2026-04-12'),
  (11, 4, 2, 5, 'Best rental experience in Halifax. Maintenance is fast.',     '2026-04-22');

INSERT INTO comments (id, review_id, user_id, body, created) VALUES
  (1, 5,  1, 'Did the parking wait ever improve?',  '2026-04-05'),
  (2, 8,  2, 'The views really are worth it.',       '2026-04-14'),
  (3, 11, 1, 'Agreed, maintenance here is fast.',    '2026-04-24');


SELECT name, neighbourhood, built
FROM apartments
WHERE neighbourhood = 'South End'
ORDER BY built DESC
LIMIT 3;

-- Change a row
UPDATE reviews
SET rating = 5
WHERE id = 11;

-- Remove a row
DELETE FROM comments
WHERE id = 3;

-- Add a column to an existing table
ALTER TABLE apartments
ADD COLUMN verified BOOLEAN DEFAULT FALSE;
-- The structure is explicit; inspect it
DESCRIBE apartments;


-- INNER JOIN: only apartments that have reviews
SELECT a.name, r.rating, r.body
FROM apartments a
JOIN reviews r ON r.apt_id = a.id;

-- LEFT JOIN: every apartment, even with no reviews
SELECT a.name, COUNT(r.id) AS reviews
FROM apartments a
LEFT JOIN reviews r ON r.apt_id = a.id
GROUP BY a.id, a.name;

SELECT a.name,
       COUNT(r.id)             AS reviews,
       ROUND(AVG(r.rating), 1) AS avg_rating
FROM apartments a
LEFT JOIN reviews r ON r.apt_id = a.id
GROUP BY a.id, a.name
HAVING avg_rating >= 4
ORDER BY avg_rating DESC;
