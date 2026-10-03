# Recruiter Bot (Backend)

## Run locally
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
python app.py
```

## API examples
```
curl http://127.0.0.1:5000/jobs/1/matches
curl http://127.0.0.1:5000/candidates/1/matches
```

## Schema
Tables: candidates, candidate_skills, candidate_traits, jobs, job_skills,
job_culture. Skills and traits are separate rows so SQL can join and count
overlaps. All SQL is hand-written with Python's sqlite3, no ORM.

## Matching algorithm
score = 55% skill overlap + 25% experience fit + 10% culture-trait overlap
+ 10% availability, scaled to 0-100.
- Skill overlap is the biggest weight because the job is nonsense without the
  required skills. Candidates with zero overlap are excluded.
- Experience is full marks at or above the minimum, proportional below it.
  Over-qualification is not penalised (a trade-off: a 20-year person for a
  2-year role still scores well).
- Availability only lowers rank ("Not looking" = 0.2), it never removes
  someone, because recruiters may still want to see them.
- Ties are broken by experience, then name.
- Limitation: culture matching is exact-word only, so "calm" does not match
  "calm-under-pressure".

## SQL Detective
See sql_detective/sql_detective.sql (setup data in setup.sql).

## AI usage
(Write honestly. For example: "I used Claude to get a step-by-step guide and
asked it to explain the code. I read and understood each file before
submitting.")

## Not done
Tests and API docs.