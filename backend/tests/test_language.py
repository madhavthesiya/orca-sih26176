"""Reader language: detected from the script, offline, for all three languages."""
from __future__ import annotations

import pytest

from app.services.i18n import detect_language


@pytest.mark.parametrize(
    "text, lang",
    [
        ("Can I go fishing near Veraval tomorrow?", "en"),
        ("क्या मैं कल वेरावल के पास मछली पकड़ने जा सकता हूँ?", "hi"),
        ("શું હું કાલે વેરાવળ પાસે માછીમારી કરવા જઈ શકું?", "gu"),
        ("Veraval પાસે wind કેવો છે?", "gu"),
        ("", "en"),
    ],
)
def test_detects_the_readers_language(text, lang):
    assert detect_language(text) == lang
