import sqlite3

# (name, skills, years, availability, traits)
CANDIDATES = [
    ("Sherlock H.", "deduction,pattern-recognition,forensics", 8, "Immediate", "analytical,blunt"),
    ("Hermione G.", "research,time-management,public-speaking", 4, "2 weeks", "detail-oriented,overachiever"),
    ("Tony S.", "systems-design,rapid-prototyping,leadership", 12, "Not looking", "confident,innovative"),
    ("Leslie K.", "project-management,stakeholder-management,public-speaking", 6, "Immediate", "tenacious,organized"),
    ("Ron S.", "woodworking,minimalism,negotiation", 15, "Not looking", "stubborn,principled"),
    ("Rick S.", "systems-design,rapid-prototyping,chemistry", 20, "Immediate", "genius,reckless"),
    ("Elle W.", "persuasion,research,public-speaking", 3, "Immediate", "optimistic,sharp"),
    ("MacGyver", "rapid-prototyping,resourcefulness,chemistry,systems-design", 10, "2 weeks", "calm,improviser"),
    ("Sheldon C.", "theoretical-analysis,pattern-recognition,research", 9, "Immediate", "rigid,brilliant"),
    ("Katniss E.", "precision,strategy,crisis-management", 5, "Immediate", "resilient,decisive"),
    ("Michael S.", "sales,public-speaking,team-building", 11, "Not looking", "enthusiastic,chaotic"),
    ("Olivia P.", "crisis-management,negotiation,strategy,leadership", 13, "2 weeks", "decisive,intense"),
    ("Ted L.", "team-building,optimism,mentorship,public-speaking", 7, "Immediate", "empathetic,persistent"),
    ("Miranda P.", "leadership,negotiation,stakeholder-management,precision", 18, "Not looking", "demanding,decisive"),
    ("Dwight S.", "sales,negotiation,security,loyalty", 9, "Immediate", "intense,loyal"),
]

# (title, required skills, min experience, culture keywords)
JOBS = [
    ("Backend Detective", "deduction,pattern-recognition,forensics", 3, "analytical,autonomous"),
    ("Rapid Prototyping Engineer", "rapid-prototyping,systems-design", 2, "innovative,fast-paced"),
    ("Developer Relations Lead", "public-speaking,research", 2, "energetic,curious"),
    ("Engineering Manager, Chaos Team", "team-building,stakeholder-management,leadership", 5, "empathetic,organized"),
    ("Incident Commander", "crisis-management,strategy,negotiation", 4, "decisive,calm-under-pressure"),
    ("Sales Engineer", "sales,public-speaking,negotiation", 3, "enthusiastic,persistent"),
]

conn = sqlite3.connect("recruiter.db")
with open("schema.sql") as f:
    conn.executescript(f.read())

for name, skills, years, availability, traits in CANDIDATES:
    cur = conn.execute(
        "INSERT INTO candidates (name, experience_years, availability) VALUES (?, ?, ?)",
        (name, years, availability),
    )
    cid = cur.lastrowid
    conn.executemany(
        "INSERT INTO candidate_skills (candidate_id, skill) VALUES (?, ?)",
        [(cid, s) for s in skills.split(",")],
    )
    conn.executemany(
        "INSERT INTO candidate_traits (candidate_id, trait) VALUES (?, ?)",
        [(cid, t) for t in traits.split(",")],
    )

for title, skills, min_exp, culture in JOBS:
    cur = conn.execute(
        "INSERT INTO jobs (title, min_experience) VALUES (?, ?)", (title, min_exp)
    )
    jid = cur.lastrowid
    conn.executemany(
        "INSERT INTO job_skills (job_id, skill) VALUES (?, ?)",
        [(jid, s) for s in skills.split(",")],
    )
    conn.executemany(
        "INSERT INTO job_culture (job_id, keyword) VALUES (?, ?)",
        [(jid, k) for k in culture.split(",")],
    )

conn.commit()
conn.close()
print("Seeded: 15 candidates, 6 jobs")