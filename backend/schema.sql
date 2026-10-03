DROP TABLE IF EXISTS candidate_skills;
DROP TABLE IF EXISTS candidate_traits;
DROP TABLE IF EXISTS job_skills;
DROP TABLE IF EXISTS job_culture;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS jobs;

CREATE TABLE candidates (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    availability     TEXT NOT NULL      -- 'Immediate', '2 weeks', 'Not looking'
);

CREATE TABLE candidate_skills (
    candidate_id INTEGER NOT NULL REFERENCES candidates(id),
    skill        TEXT NOT NULL,
    PRIMARY KEY (candidate_id, skill)
);

CREATE TABLE candidate_traits (
    candidate_id INTEGER NOT NULL REFERENCES candidates(id),
    trait        TEXT NOT NULL,
    PRIMARY KEY (candidate_id, trait)
);

CREATE TABLE jobs (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    title          TEXT NOT NULL,
    min_experience INTEGER NOT NULL
);

CREATE TABLE job_skills (
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    skill  TEXT NOT NULL,
    PRIMARY KEY (job_id, skill)
);

CREATE TABLE job_culture (
    job_id  INTEGER NOT NULL REFERENCES jobs(id),
    keyword TEXT NOT NULL,
    PRIMARY KEY (job_id, keyword)
);