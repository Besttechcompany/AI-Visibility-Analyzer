from .evidence import EvidenceCollector
from .detector import TechnologyDetector


class TechnologyAnalyzer:

    @staticmethod
    def analyze(response, soup):
        """
        Analyze a website and detect technologies.

        Parameters
        ----------
        response : requests.Response
            Original HTTP response from analyzer.py

        soup : BeautifulSoup
            Reserved for future compatibility.
            Not used because Playwright performs
            browser-based collection.

        Returns
        -------
        list
            List of detected technologies.
        """

        print("=" * 60)
        print("Technology Analyzer")
        print("=" * 60)

        url = response.url

        print(f"Analyzing: {url}")

        # Collect browser evidence
        evidence = EvidenceCollector.collect(url)

        print("Evidence collection completed.")

        # Detect technologies
        detections = TechnologyDetector.detect(evidence)

        output = []

        for detection in detections:

            output.append({

                "technology": detection.technology,

                "category": detection.category,

                "confidence": detection.confidence,

                "evidence": detection.evidence

            })

        output.sort(

            key=lambda x: (

                -x["confidence"],

                x["technology"].lower()

            )

        )

        print("=" * 60)
        print(f"Total Technologies: {len(output)}")
        print("=" * 60)

        return output