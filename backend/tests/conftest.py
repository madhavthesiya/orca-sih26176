"""Shared fixtures. Every test runs on the offline DEMO edition, so the suite
needs no network and gives the same answer on every machine."""
from __future__ import annotations

import os

os.environ["ORCA_DATA_MODE"] = "DEMO"
os.environ["ORCA_USE_LLM"] = "0"

import pytest
from fastapi.testclient import TestClient

from app.config import set_data_mode
from app.main import app


@pytest.fixture(autouse=True)
def _demo_edition():
    set_data_mode("DEMO")
    yield
    set_data_mode("DEMO")


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def calm() -> dict:
    """A flat, warning-free morning a few km offshore — the baseline every
    safety-floor test perturbs one input at a time."""
    return dict(
        wave_height_m=0.6,
        wave_period_s=7.0,
        wind_speed_kmh=12.0,
        rain_probability_pct=5.0,
        lightning=False,
        visibility_km=10.0,
        sea_state_label="slight",
        current_speed_ms=0.2,
        alerts=[],
        distance_from_shore_km=8.0,
        nearest_zone_km=None,
        inside_zone=False,
        sources=["test"],
    )
