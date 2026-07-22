import json
from pathlib import Path


class FingerprintLoader:

    @staticmethod
    def load():

        folder = Path(__file__).parent / "fingerprints"

        fingerprints = []

        if not folder.exists():
            raise FileNotFoundError(
                f"Fingerprint folder not found: {folder}"
            )

        for file in sorted(folder.glob("*.json")):

            with open(file, "r", encoding="utf-8") as f:

                data = json.load(f)

                if isinstance(data, list):

                    fingerprints.extend(data)

        return fingerprints