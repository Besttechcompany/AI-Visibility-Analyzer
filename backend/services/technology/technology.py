from .evidence import EvidenceCollector

from .detector import TechnologyDetector


class TechnologyAnalyzer:

    @staticmethod
    def analyze(response, soup):

        evidence = EvidenceCollector.collect(

            response,

            soup

        )

        detections = TechnologyDetector.detect(

            evidence

        )

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