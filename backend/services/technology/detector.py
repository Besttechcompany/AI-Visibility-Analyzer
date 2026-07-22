import json
from pathlib import Path

from .matcher import RuleMatcher


class TechnologyDetector:

    @staticmethod
    def detect(evidence):

        results = []

        fingerprint_folder = Path(__file__).parent / "fingerprints"

        print("=" * 60)
        print("Fingerprint Folder:", fingerprint_folder)

        files = list(fingerprint_folder.glob("*.json"))

        print("JSON Files Found:", len(files))

        for file in files:

            print("Loading:", file.name)

            with open(file, "r", encoding="utf-8") as f:

                fingerprints = json.load(f)

            print("Fingerprints:", len(fingerprints))

            for fp in fingerprints:

                detection = RuleMatcher.match(evidence, fp)

                if detection:

                    print("MATCH:", detection.technology)

                    results.append(detection)

        print("Total Matches:", len(results))
        print("=" * 60)

        return results