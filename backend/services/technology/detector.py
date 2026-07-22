from .loader import FingerprintLoader
from .matcher import RuleMatcher


class TechnologyDetector:

    @staticmethod
    def detect(evidence):

        print("=" * 60)
        print("Technology Detection Started")
        print("=" * 60)

        fingerprints = FingerprintLoader.load()

        print(f"Fingerprints Loaded: {len(fingerprints)}")

        detections = []

        for fingerprint in fingerprints:

            try:

                result = RuleMatcher.match(
                    evidence,
                    fingerprint
                )

                if result:

                    print(
                        f"[MATCH] {result.technology} "
                        f"({result.confidence}%)"
                    )

                    detections.append(result)

            except Exception as e:

                technology = fingerprint.get(
                    "technology",
                    "Unknown"
                )

                print(
                    f"[ERROR] {technology}: {e}"
                )

        # Remove duplicate technologies
        unique = {}

        for detection in detections:

            tech = detection.technology

            if tech not in unique:

                unique[tech] = detection

            elif detection.confidence > unique[tech].confidence:

                unique[tech] = detection

        results = list(unique.values())

        results.sort(

            key=lambda item: (

                -item.confidence,

                item.technology.lower()

            )

        )

        print("=" * 60)
        print(f"Detected Technologies: {len(results)}")
        print("=" * 60)

        return results