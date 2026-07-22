import json
from pathlib import Path

from .matcher import RuleMatcher


class TechnologyDetector:

    @staticmethod
    def detect(evidence):

        results = []

        fingerprint_folder = (

            Path(__file__).parent

            / "fingerprints"

        )

        for file in fingerprint_folder.glob("*.json"):

            with open(

                file,

                "r",

                encoding="utf-8"

            ) as f:

                fingerprints = json.load(f)

            for fp in fingerprints:

                detection = RuleMatcher.match(

                    evidence,

                    fp

                )

                if detection:

                    results.append(

                        detection

                    )

        return results