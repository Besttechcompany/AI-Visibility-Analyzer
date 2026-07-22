from .loader import FingerprintLoader
from .matcher import RuleMatcher


class TechnologyDetector:

    @staticmethod
    def detect(evidence):

        results = []

        # Load all fingerprint files
        fingerprints = FingerprintLoader.load()

        # Debug message
        print(f"Loaded {len(fingerprints)} fingerprints")

        for fp in fingerprints:

            detection = RuleMatcher.match(
                evidence,
                fp
            )

            if detection:
                results.append(detection)

        results.sort(
            key=lambda x: x.confidence,
            reverse=True
        )

        return results