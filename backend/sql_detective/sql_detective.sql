-- Q1: Open job postings with the recruiter who owns each
SELECT jp.id, jp.title, jp.department, r.name AS recruiter_name
FROM job_postings jp
JOIN recruiters r ON r.id = jp.recruiter_id
WHERE jp.status = 'open';

-- Q2: Applicants who reached the Final stage, per job posting
-- LEFT JOIN keeps postings with zero finalists (shown as 0)
SELECT jp.id, jp.title, COUNT(DISTINCT i.applicant_id) AS finalists
FROM job_postings jp
LEFT JOIN interviews i
       ON i.job_posting_id = jp.id AND i.stage = 'Final'
GROUP BY jp.id, jp.title
ORDER BY jp.id;

-- Q3: People who effectively applied to more than one job posting
-- Ananya Rao appears twice with emails differing only by letter case,
-- so people are identified by LOWER(TRIM(email)), not by applicant id.
-- "Applied" is taken from interviews, since there is no applications table.
SELECT LOWER(TRIM(a.email)) AS email,
       MIN(a.full_name) AS full_name,
       COUNT(DISTINCT i.job_posting_id) AS jobs_applied
FROM applicants a
JOIN interviews i ON i.applicant_id = a.id
GROUP BY LOWER(TRIM(a.email))
HAVING COUNT(DISTINCT i.job_posting_id) > 1;

-- Q4: Final-stage conversion rate per recruiter (min 3 Final interviews)
SELECT r.name,
       COUNT(*) AS final_interviews,
       SUM(CASE WHEN i.outcome = 'passed' THEN 1 ELSE 0 END) AS passed,
       ROUND(100.0 * SUM(CASE WHEN i.outcome = 'passed' THEN 1 ELSE 0 END)
             / COUNT(*), 1) AS conversion_pct
FROM interviews i
JOIN job_postings jp ON jp.id = i.job_posting_id
JOIN recruiters r ON r.id = jp.recruiter_id
WHERE i.stage = 'Final'
GROUP BY r.id, r.name
HAVING COUNT(*) >= 3;

-- Q5 (Bonus): Recruiter with the most placements (passed Final) per department
WITH placements AS (
    SELECT jp.department, r.id AS recruiter_id, r.name, COUNT(*) AS placements
    FROM interviews i
    JOIN job_postings jp ON jp.id = i.job_posting_id
    JOIN recruiters r ON r.id = jp.recruiter_id
    WHERE i.stage = 'Final' AND i.outcome = 'passed'
    GROUP BY jp.department, r.id, r.name
),
ranked AS (
    SELECT *,
           RANK() OVER (PARTITION BY department ORDER BY placements DESC) AS rnk
    FROM placements
)
SELECT department, name, placements
FROM ranked
WHERE rnk = 1;