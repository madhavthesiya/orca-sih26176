"""Language detection and response templates for English / Hindi / Gujarati.

Two deliberate rules:
  * numeric values are NEVER localised into other numeral systems — "2.4 m"
    stays "2.4 m" in all three languages so a number can never be misread;
  * detection is script + marker based, so it works with no network and no LLM.
"""
from __future__ import annotations

import re
from typing import Dict, List

from ..schemas import Language

DEVANAGARI = re.compile(r"[ऀ-ॿ]")
GUJARATI_SCRIPT = re.compile(r"[\u0A80-\u0AFF]")

# Words that separate Hindi from other Devanagari scripts.
HINDI_MARKERS = ["है", "सकता", "सकती", "मछली", "क्या", "नहीं", "समुद्र में",
                 "नाव", "मुझे", "कहाँ", "कहां", "रास्ता"]


def detect_language(text: str) -> Language:
    if not text:
        return "en"
    if GUJARATI_SCRIPT.search(text):
        return "gu"
    if not DEVANAGARI.search(text):
        return "en"
    hi = sum(1 for w in HINDI_MARKERS if w in text)
    if hi > 0:
        return "hi"
    return "hi"  # Devanagari default


# --------------------------------------------------------------------------
# Phrase book
# --------------------------------------------------------------------------
T: Dict[str, Dict[Language, str]] = {
    "verdict_low": {
        "en": "Conditions look safe",
        "hi": "स्थिति सुरक्षित लग रही है",
        "gu": "પરિસ્થિતિ સુરક્ષિત લાગે છે",
    },
    "verdict_moderate": {
        "en": "Go with caution",
        "hi": "सावधानी से जाएँ",
        "gu": "સાવચેત રહીને જાઓ",
    },
    "verdict_high": {
        "en": "High risk — not recommended",
        "hi": "जोखिम अधिक है — जाने की सलाह नहीं",
        "gu": "ઊંચું જોખમ — જવાની સલાહ નથી",
    },
    "verdict_extreme": {
        "en": "EXTREME RISK — do not go to sea",
        "hi": "अत्यधिक जोखिम — समुद्र में न जाएँ",
        "gu": "અત્યંત જોખમ — સમુદ્રમાં ન જાઓ",
    },
    "based_on": {
        "en": "Based on available data",
        "hi": "उपलब्ध आँकड़ों के आधार पर",
        "gu": "ઉપલબ્ધ માહિતીના આધારે",
    },
    "risk_score": {
        "en": "Risk score",
        "hi": "जोखिम स्कोर",
        "gu": "જોખમ સ્કોર",
    },
    "why": {
        "en": "Main reasons",
        "hi": "मुख्य कारण",
        "gu": "મુખ્ય કારણો",
    },
    "official_warning": {
        "en": "An official warning is in force. Please follow IMD / INCOIS and Coast Guard instructions.",
        "hi": "आधिकारिक चेतावनी लागू है। कृपया IMD / INCOIS और तटरक्षक बल के निर्देशों का पालन करें।",
        "gu": "સત્તાવાર ચેતવણી અમલમાં છે. કૃપા કરીને IMD / INCOIS અને કોસ્ટ ગાર્ડની સૂચનાઓ પાળો.",
    },
    "improves_at": {
        "en": "Conditions are expected to improve after {hour}:00. Ask me again then.",
        "hi": "{hour}:00 बजे के बाद स्थिति सुधरने की संभावना है। तब दोबारा पूछें।",
        "gu": "{hour}:00 પછી પરિસ્થિતિ સુધરવાની અપેક્ષા છે. ત્યારે ફરી પૂછો.",
    },
    "no_improvement": {
        "en": "Conditions are not expected to improve today.",
        "hi": "आज स्थिति सुधरने की संभावना नहीं है।",
        "gu": "આજે પરિસ્થિતિ સુધરવાની અપેક્ષા નથી.",
    },
    "pfz_intro": {
        "en": "Nearest potential fishing zones",
        "hi": "निकटतम संभावित मत्स्य क्षेत्र",
        "gu": "નજીકના સંભવિત માછીમારી વિસ્તારો",
    },
    "pfz_note": {
        "en": "A potential fishing zone is a scientifically likely area — it is not a guarantee of fish.",
        "hi": "संभावित मत्स्य क्षेत्र वैज्ञानिक रूप से संभावित क्षेत्र है — मछली की गारंटी नहीं।",
        "gu": "સંભવિત માછીમારી ક્ષેત્ર એ વૈજ્ઞાનિક રીતે શક્ય વિસ્તાર છે — માછલીની ગેરેંટી નથી.",
    },
    "route_intro": {
        "en": "Safest route",
        "hi": "सबसे सुरक्षित रास्ता",
        "gu": "સૌથી સુરક્ષિત માર્ગ",
    },
    "route_detail": {
        "en": "{distance} km, about {eta}, avoiding restricted areas.",
        "hi": "{distance} किमी, लगभग {eta}, प्रतिबंधित क्षेत्रों से बचते हुए।",
        "gu": "{distance} કિ.મી., આશરે {eta}, પ્રતિબંધિત વિસ્તારો ટાળીને.",
    },
    "geofence_warn": {
        "en": "WARNING: {zone} is {distance} km away.",
        "hi": "चेतावनी: {zone} {distance} किमी दूर है।",
        "gu": "ચેતવણી: {zone} {distance} કિ.મી. દૂર છે.",
    },
    "geofence_inside": {
        "en": "ALERT: you are inside {zone}. Leave the area immediately.",
        "hi": "अलर्ट: आप {zone} के भीतर हैं। तुरंत क्षेत्र छोड़ें।",
        "gu": "ચેતવણી: તમે {zone} ની અંદર છો. તાત્કાલિક વિસ્તાર છોડો.",
    },
    "sources": {
        "en": "Sources",
        "hi": "स्रोत",
        "gu": "સ્રોત",
    },
    "updated": {
        "en": "Updated",
        "hi": "अपडेट",
        "gu": "અપડેટ",
    },
    "demo_mode": {
        "en": "Demo / simulated data — not a live government feed.",
        "hi": "डेमो / नकली आँकड़े — यह सरकारी लाइव फ़ीड नहीं है।",
        "gu": "ડેમો / સિમ્યુલેટેડ ડેટા — આ સરકારી લાઇવ ફીડ નથી.",
    },
    "unavailable": {
        "en": "Ocean forecast unavailable for this location.",
        "hi": "इस स्थान के लिए समुद्री पूर्वानुमान उपलब्ध नहीं है।",
        "gu": "આ સ્થાન માટે સમુદ્રી અંદાજ ઉપલબ્ધ નથી.",
    },
    "hours": {"en": "h", "hi": "घं", "gu": "કલાક"},
    "minutes": {"en": "min", "hi": "मि", "gu": "મિનિટ"},
    "disclaimer": {
        "en": "ORCA is a decision-support tool. It does not replace official marine "
              "advisories or Coast Guard instructions.",
        "hi": "ORCA एक निर्णय-सहायक उपकरण है। यह आधिकारिक समुद्री सलाह या तटरक्षक "
              "निर्देशों का विकल्प नहीं है।",
        "gu": "ORCA એ નિર્ણય-સહાય સાધન છે. તે સત્તાવાર સમુદ્રી સલાહ અથવા "
              "કોસ્ટ ગાર્ડની સૂચનાઓનો વિકલ્પ નથી.",
    },
}

SUGGESTIONS: Dict[Language, List[str]] = {
    "en": ["What about 12 PM?", "Show nearby fishing zones", "Give me the safest route",
           "Is there a cyclone nearby?"],
    "hi": ["दोपहर 12 बजे कैसा रहेगा?", "पास के मत्स्य क्षेत्र दिखाओ", "सबसे सुरक्षित रास्ता बताओ",
           "क्या आसपास कोई चक्रवात है?"],
    "gu": ["બપોરે 12 વાગ્યે કેવું રહેશે?", "નજીકના PFZ દેખાડો", "સૌથી સુરક્ષિત માર્ગ બતાવો",
           "આસપાસ કોઈ વાવાઝોડું છે?"],
}


def t(key: str, lang: Language, **kwargs) -> str:
    template = T.get(key, {}).get(lang) or T.get(key, {}).get("en", key)
    return template.format(**kwargs) if kwargs else template


def verdict_key(category: str) -> str:
    return {"LOW": "verdict_low", "MODERATE": "verdict_moderate",
            "HIGH": "verdict_high", "EXTREME": "verdict_extreme"}[category]


def humanise_duration(minutes: int, lang: Language) -> str:
    h, m = divmod(int(minutes), 60)
    if h and m:
        return f"{h} {t('hours', lang)} {m} {t('minutes', lang)}"
    if h:
        return f"{h} {t('hours', lang)}"
    return f"{m} {t('minutes', lang)}"
