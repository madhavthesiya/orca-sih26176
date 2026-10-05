"""The spoken advisory: verdict first, and on a no-go day nothing that plans a trip."""
from __future__ import annotations

import re

import pytest

from app.services import plain_language

GUJARATI = re.compile(r"[઀-૿]")
DEVANAGARI = re.compile(r"[ऀ-ॿ]")

GROUND = {"rank": 1, "rating": "very_good", "distance_km": 22, "bearing": "SW", "recommended": True}
BEST_TIME = {"en": "best time to fish", "hi": "सबसे अच्छा समय", "gu": "શ્રેષ્ઠ સમય"}


def advice(lang="en", category="LOW", feasible=True):
    return plain_language.build(
        lang=lang,
        risk_category=category,
        official_warning=category == "EXTREME",
        wave_m=0.8 if category == "LOW" else 4.6,
        wind_kmh=12 if category == "LOW" else 80,
        improve_hour=None,
        zones=[GROUND],
        closed_zones=[],
        duration={"feasible": feasible, "recommended_hours": 3, "total_trip_hours": 5,
                  "limited_by_weather": False},
        best_window=[5, 8],
        forecast=[],
    )


@pytest.mark.parametrize("lang", ["en", "hi", "gu"])
def test_a_good_day_names_the_best_time(lang):
    assert any(BEST_TIME[lang] in line for line in advice(lang))


@pytest.mark.parametrize("lang", ["en", "hi", "gu"])
@pytest.mark.parametrize("category, feasible", [("EXTREME", True), ("LOW", False)])
def test_a_no_go_day_names_no_grounds_and_no_hours(lang, category, feasible):
    lines = advice(lang, category, feasible)
    assert not any(BEST_TIME[lang] in line for line in lines)
    assert not any("22" in line for line in lines), "the ground's distance must not be offered"


def test_the_verdict_always_comes_first():
    assert advice("en", "EXTREME")[0].startswith("Do not go out")


def test_each_language_is_written_in_its_own_script():
    assert all(GUJARATI.search(line) for line in advice("gu")[:2])
    assert all(DEVANAGARI.search(line) for line in advice("hi")[:2])
