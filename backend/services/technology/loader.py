import json
from pathlib import Path


class FingerprintLoader:

    @staticmethod
    def load():

        folder = Path(__file__).parent / "fingerprints"

        print("=" * 60)
        print("Folder Exists:", folder.exists())
        print("Folder:", folder)

        print("Directory Contents:")
        for item in folder.iterdir():
            print(" -", item.name)

        files = list(folder.glob("*.json"))

        print("JSON Files:", [f.name for f in files])

        fingerprints = []

        for file in files:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)

                if isinstance(data, list):
                    fingerprints.extend(data)

        print("Total Fingerprints Loaded:", len(fingerprints))
        print("=" * 60)

        return fingerprints