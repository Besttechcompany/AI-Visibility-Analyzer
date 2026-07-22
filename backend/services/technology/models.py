from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class BrowserEvidence:
    """
    Stores all evidence collected from the browser.
    """

    url: str
    final_url: str

    html: str

    headers: Dict[str, str] = field(default_factory=dict)

    meta: Dict[str, str] = field(default_factory=dict)

    scripts: List[str] = field(default_factory=list)

    stylesheets: List[str] = field(default_factory=list)

    cookies: Dict[str, str] = field(default_factory=dict)

    local_storage: Dict[str, str] = field(default_factory=dict)

    session_storage: Dict[str, str] = field(default_factory=dict)

    javascript_globals: List[str] = field(default_factory=list)

    network_requests: List[str] = field(default_factory=list)


@dataclass
class TechnologyMatch:
    """
    Stores one detected technology.
    """

    technology: str

    category: str

    confidence: int

    evidence: List[str] = field(default_factory=list)