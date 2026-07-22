import json
from pathlib import Path


class FingerprintLoader:

    @staticmethod
    def load():

        folder = Path(__file__).parent / "fingerprints"

        fingerprints = []

        for file in sorted(folder.glob("*.json")):

            with open(file, "r", encoding="utf-8") as f:

                print(f"Loading: {file.name}")

                try:
                    data = json.load(f)

                except json.JSONDecodeError as e:
                    print(f"Invalid JSON in {file.name}: {e}")
                    continue

                if isinstance(data, list):
                    fingerprints.extend(data)

        return fingerprints