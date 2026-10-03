import sqlite3
from flask import Flask, g, jsonify

from matching import PAIR_SQL, build_matches

DB_PATH = "recruiter.db"
app = Flask(__name__)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row  # lets us read columns by name
    return g.db


@app.teardown_appcontext
def close_db(error):
    db = g.pop("db", None)
    if db is not None:
        db.close()


@app.get("/jobs/<int:job_id>/matches")
def job_matches(job_id):
    db = get_db()
    job = db.execute(
        "SELECT id, title, min_experience FROM jobs WHERE id = ?", (job_id,)
    ).fetchone()
    if job is None:
        return jsonify(error="Job not found"), 404

    rows = db.execute(PAIR_SQL, {"job_id": job_id, "candidate_id": None}).fetchall()
    return jsonify(job=dict(job), matches=build_matches(rows))


@app.get("/candidates/<int:candidate_id>/matches")
def candidate_matches(candidate_id):
    db = get_db()
    candidate = db.execute(
        "SELECT id, name, experience_years, availability FROM candidates WHERE id = ?",
        (candidate_id,),
    ).fetchone()
    if candidate is None:
        return jsonify(error="Candidate not found"), 404

    rows = db.execute(PAIR_SQL, {"job_id": None, "candidate_id": candidate_id}).fetchall()
    return jsonify(candidate=dict(candidate), matches=build_matches(rows))


if __name__ == "__main__":
    app.run(debug=True)