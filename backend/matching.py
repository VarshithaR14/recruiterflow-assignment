# One query returns every (candidate, job) pair with the raw counts we need.
# The :job_id / :candidate_id filters are optional (NULL means "no filter").
PAIR_SQL = """
SELECT
    c.id AS candidate_id,
    c.name AS candidate_name,
    c.experience_years,
    c.availability,
    j.id AS job_id,
    j.title AS job_title,
    j.min_experience,
    (SELECT COUNT(*) FROM candidate_skills cs
       JOIN job_skills js ON js.skill = cs.skill
      WHERE cs.candidate_id = c.id AND js.job_id = j.id) AS skill_overlap,
    (SELECT group_concat(cs.skill, ', ') FROM candidate_skills cs
       JOIN job_skills js ON js.skill = cs.skill
      WHERE cs.candidate_id = c.id AND js.job_id = j.id) AS matched_skills,
    (SELECT COUNT(*) FROM job_skills WHERE job_id = j.id) AS skills_required,
    (SELECT COUNT(*) FROM candidate_traits ct
       JOIN job_culture jc ON jc.keyword = ct.trait
      WHERE ct.candidate_id = c.id AND jc.job_id = j.id) AS culture_overlap,
    (SELECT COUNT(*) FROM job_culture WHERE job_id = j.id) AS culture_total
FROM candidates c
CROSS JOIN jobs j
WHERE (:job_id IS NULL OR j.id = :job_id)
  AND (:candidate_id IS NULL OR c.id = :candidate_id)
"""

# Weights add up to 1.0
W_SKILL = 0.55
W_EXPERIENCE = 0.25
W_CULTURE = 0.10
W_AVAILABILITY = 0.10

AVAILABILITY_SCORE = {"Immediate": 1.0, "2 weeks": 0.7, "Not looking": 0.2}


def score_row(row):
    skill = row["skill_overlap"] / row["skills_required"]

    if row["min_experience"] == 0:
        experience = 1.0
    else:
        experience = min(1.0, row["experience_years"] / row["min_experience"])

    culture = (
        row["culture_overlap"] / row["culture_total"] if row["culture_total"] else 0.0
    )
    availability = AVAILABILITY_SCORE.get(row["availability"], 0.5)

    total = (
        W_SKILL * skill
        + W_EXPERIENCE * experience
        + W_CULTURE * culture
        + W_AVAILABILITY * availability
    )
    return round(total * 100, 1)


def build_reason(row):
    return (
        f"{row['skill_overlap']}/{row['skills_required']} required skills "
        f"({row['matched_skills']}); "
        f"{row['experience_years']} yrs vs {row['min_experience']} min; "
        f"{row['culture_overlap']}/{row['culture_total']} culture traits; "
        f"availability: {row['availability']}"
    )


def build_matches(rows):
    """Score rows, drop pairs with zero skill overlap, rank best first."""
    matches = []
    for row in rows:
        if row["skill_overlap"] == 0:
            continue
        matches.append(
            {
                "candidate_id": row["candidate_id"],
                "candidate_name": row["candidate_name"],
                "job_id": row["job_id"],
                "job_title": row["job_title"],
                "score": score_row(row),
                "reason": build_reason(row),
                "_years": row["experience_years"],
            }
        )
    # Highest score first; ties go to more experience, then name (stable order)
    matches.sort(key=lambda m: (-m["score"], -m["_years"], m["candidate_name"]))
    for m in matches:
        del m["_years"]
    return matches