"""
AI Visibility Analyzer
Technology Detection Engine

This package provides browser-based technology detection using
Playwright and fingerprint matching.

Modules
-------
models.py
    Data models used across the technology engine.

browser.py
    Collects browser-rendered evidence using Playwright.

evidence.py
    Wrapper around the browser collector.

loader.py
    Loads all fingerprint JSON files.

matcher.py
    Matches browser evidence against fingerprint rules.

detector.py
    Detects technologies from collected evidence.

technology.py
    Main entry point used by the analyzer.
"""

__version__ = "2.0.0"

__author__ = "Best Tech Company"

from .models import (
    BrowserEvidence,
    TechnologyMatch,
)

from .browser import Browser

from .evidence import EvidenceCollector

from .loader import FingerprintLoader

from .matcher import RuleMatcher

from .detector import TechnologyDetector

from .technology import TechnologyAnalyzer

__all__ = [
    "BrowserEvidence",
    "TechnologyMatch",
    "Browser",
    "EvidenceCollector",
    "FingerprintLoader",
    "RuleMatcher",
    "TechnologyDetector",
    "TechnologyAnalyzer",
]