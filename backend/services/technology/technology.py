from .evidence import EvidenceCollector
from .detector import TechnologyDetector


class TechnologyAnalyzer:

    @staticmethod
    def analyze(response, soup):

        print("=" * 60)
        print("TechnologyAnalyzer.analyze() called")
        print("=" * 60)

        evidence = EvidenceCollector.collect(
            response,
            soup
        )

        print("Evidence collected successfully")

        detections = TechnologyDetector.detect(
            evidence
        )

        print(f"Detections Found: {len(detections)}")

        output = []

        for d in detections:

            output.append({

                "technology": d.technology,

                "category": d.category,

                "confidence": d.confidence,

                "evidence": d.evidence

            })

        output.sort(

            key=lambda x: (

                -x["confidence"],

                x["technology"]

            )

        )

        return output