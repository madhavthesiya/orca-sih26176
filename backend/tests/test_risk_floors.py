"""The deterministic layer of the risk engine: floors that no weighting,
model or LLM can talk down, and abstention when the sea cannot be read."""
from __future__ import annotations

import pytest

from app.config import RISK
from app.services.risk_engine import assess


def test_calm_sea_is_a_go(calm):
    r = assess(**calm)
    assert r.category == "LOW"
    assert r.go is True
    assert r.overrides == []


@pytest.mark.parametrize(
    "change, floor",
    [
        ({"lightning": True}, 65),
        ({"wave_height_m": RISK.wave_danger_m}, RISK.wave_danger_floor),
        ({"wind_speed_kmh": RISK.wind_danger_kmh}, RISK.wind_danger_floor),
        ({"inside_zone": True}, RISK.restricted_zone_floor),
        (
            {"alerts": [{"type": "cyclone", "severity": "severe", "official": True,
                         "headline": "Severe cyclonic storm", "source": "IMD"}]},
            RISK.severe_warning_floor,
        ),
    ],
)
def test_each_hazard_lifts_the_score_to_its_floor(calm, change, floor):
    r = assess(**{**calm, **change})
    assert r.score >= floor
    assert r.overrides, "a floor that fires must say why"


def test_floors_only_ever_raise_the_score(calm):
    stormy = {**calm, "wave_height_m": 3.5, "wind_speed_kmh": 55.0}
    base = assess(**stormy).score
    assert assess(**{**stormy, "lightning": True}).score >= base


def test_an_official_warning_is_never_a_go(calm):
    alert = {"type": "fishermen_warning", "severity": "moderate", "official": True,
             "headline": "Fishermen advised not to venture", "source": "IMD"}
    r = assess(**{**calm, "alerts": [alert]})
    assert r.official_warning is True
    assert r.go is False


def test_abstains_when_neither_waves_nor_wind_are_known(calm):
    r = assess(**{**calm, "wave_height_m": None, "wind_speed_kmh": None})
    assert r.category == "UNKNOWN"
    assert r.score == -1
    assert r.go is False


def test_one_missing_reading_does_not_abstain(calm):
    r = assess(**{**calm, "wind_speed_kmh": None})
    assert r.category != "UNKNOWN"
