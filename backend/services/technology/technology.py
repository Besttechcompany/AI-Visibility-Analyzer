import time
from collections import defaultdict

from .evidence import EvidenceCollector
from .detector import TechnologyDetector


class TechnologyAnalyzer:

    @staticmethod
    def analyze(browser, response, soup):

        total_start = time.time()

        print("=" * 60)
        print("Technology Analyzer")
        print("=" * 60)

        url = response.url

        print(f"Analyzing: {url}")

        # ---------------------------------------
        # Evidence Collection
        # ---------------------------------------

        evidence_start = time.time()

        evidence = EvidenceCollector.collect(
            browser,
            url
        )

        print(f"Evidence collection completed in {time.time() - evidence_start:.2f} sec")

        # ---------------------------------------
        # Technology Detection
        # ---------------------------------------

        detect_start = time.time()

        detections = TechnologyDetector.detect(
            evidence
        )

        print(f"Technology detection completed in {time.time() - detect_start:.2f} sec")

        categories = defaultdict(list)

        for detection in detections:

            categories[detection.category].append({

                "technology": detection.technology,

                "confidence": detection.confidence,

                "evidence": detection.evidence

            })

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
        print(f"Technology Analyzer Total : {time.time() - total_start:.2f} sec")
        print("=" * 60)

        return result