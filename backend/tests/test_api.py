"""HTTP contract the frontend relies on, exercised end to end on DEMO data."""
from __future__ import annotations

import re

MUMBAI = {"lat": 18.92, "lon": 72.83}
PARADIP = {"lat": 20.26, "lon": 86.67}


def test_health_reports_the_crew(client):
    body = client.get("/api/health").json()
    assert body["status"] == "ok"
    assert body["data_mode"] == "DEMO"
    assert len(body["agents"]) == 10


def test_outlook_has_everything_the_today_view_draws(client):
    r = client.get("/api/fishing", params={**MUMBAI, "lang": "en"})
    assert r.status_code == 200
    o = r.json()
    for key in ("location", "generated_at", "safety", "areas", "duration", "advice", "forecast", "mode"):
        assert key in o
    assert o["mode"] == "DEMO"
    assert o["advice"], "the advisory is never empty"


def test_outlook_speaks_gujarati(client):
    o = client.get("/api/fishing", params={**MUMBAI, "lang": "gu"}).json()
    assert re.search(r"[઀-૿]", o["advice"][0])


def test_outlook_rejects_an_unsupported_language(client):
    assert client.get("/api/fishing", params={**MUMBAI, "lang": "fr"}).status_code == 422


def test_cyclone_coast_is_a_no_go_with_its_warning(client):
    o = client.get("/api/fishing", params={**PARADIP, "lang": "en"}).json()
    assert o["safety"]["category"] in ("HIGH", "EXTREME")
    assert o["safety"]["official_warning"] is True


def test_chat_answers_in_the_language_it_was_asked(client):
    r = client.post("/api/chat", json={"message": "શું હું આજે પારાદીપ પાસે માછીમારી કરી શકું?",
                                       "session_id": "test-gu"})
    assert r.status_code == 200
    body = r.json()
    assert body["language"] == "gu"
    assert body["trace"], "every answer carries the crew's trace"


def test_large_responses_are_compressed(client):
    r = client.get("/api/map/zones", headers={"Accept-Encoding": "gzip"})
    assert r.headers.get("content-encoding") == "gzip"
