from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class Evidence:

    html: str

    headers: Dict[str, str]

    scripts: List[str]

    stylesheets: List[str]

    links: List[str]

    body_classes: List[str]

    html_classes: List[str]

    ids: List[str]

    meta: Dict[str, str]

    meta_generator: str

    cookies: Dict[str, str]

    response_url: str

    title: str

    json_ld: List[str]


@dataclass
class DetectionResult:

    technology: str

    category: str

    confidence: int

    evidence: List[str] = field(default_factory=list)