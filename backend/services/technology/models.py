from dataclasses import dataclass, field
from typing import List


@dataclass
class Evidence:

    html: str

    headers: dict

    scripts: List[str]

    stylesheets: List[str]

    meta_generator: str

    meta: dict

    cookies: dict

    response_url: str


@dataclass
class DetectionResult:

    technology: str

    category: str

    confidence: int

    evidence: List[str] = field(default_factory=list)