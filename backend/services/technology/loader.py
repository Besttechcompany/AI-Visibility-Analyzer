import json
from pathlib import Path


class FingerprintLoader:

    _cache = None

    @classmethod
    def load(cls):

        if cls._cache is not None:
            return cls._cache

        fingerprints = []

        fingerprint_dir = (
            Path(__file__).parent / "fingerprints"
        )

        print("=" * 60)
        print("Loading Fingerprints")
        print("=" * 60)

        if not fingerprint_dir.exists():

            print(f"Directory not found: {fingerprint_dir}")

            cls._cache = []

            return cls._cache

        json_files = sorted(
            fingerprint_dir.glob("*.json")
        )

        print(f"JSON Files Found: {len(json_files)}")

        for file in json_files:

            print(f"Loading {file.name}")

            try:

                with open(
                    file,
                    "r",
                    encoding="utf-8"
                ) as f:

                    data = json.load(f)

                if isinstance(data, list):

                    fingerprints.extend(data)

                elif isinstance(data, dict):

                    fingerprints.append(data)

                else:

                    print(
                        f"Skipping unsupported format: {file.name}"
                    )

            except Exception as e:

                print(
                    f"Error loading {file.name}: {e}"
                )

        print("=" * 60)
        print(
            f"Loaded {len(fingerprints)} fingerprints"
        )
        print("=" * 60)

        cls._cache = fingerprints

        return cls._cache

    @classmethod
    def clear_cache(cls):

        cls._cache = None