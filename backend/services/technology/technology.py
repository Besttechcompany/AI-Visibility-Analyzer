from collections import defaultdict

from .evidence import EvidenceCollector
from .detector import TechnologyDetector


class TechnologyAnalyzer:

    @staticmethod
    def analyze(response, soup):

        print("=" * 60)
        print("Technology Analyzer")
        print("=" * 60)

        url = response.url

        print(f"Analyzing: {url}")

        # Collect browser evidence
        evidence = EvidenceCollector.collect(url)

        print("Evidence collection completed.")

        # Detect technologies
        detections = TechnologyDetector.detect(evidence)

        categories = defaultdict(list)

        for detection in detections:

            categories[detection.category].append({

                "technology": detection.technology,

                "confidence": detection.confidence,

                "evidence": detection.evidence

            })

        # Sort technologies inside each category
        for category in categories:

            categories[category].sort(

                key=lambda x: (

                    -x["confidence"],

                    x["technology"].lower()

                )

            )

        result = {

            "total_technologies": len(detections),

            "total_categories": len(categories),

            "categories": dict(categories)

        }

        print("=" * 60)
        print(f"Categories : {result['total_categories']}")
        print(f"Technologies : {result['total_technologies']}")
        print("=" * 60)

        return result