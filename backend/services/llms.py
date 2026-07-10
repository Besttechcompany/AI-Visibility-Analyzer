import requests
from urllib.parse import urljoin


class LLMAnalyzer:

    @staticmethod
    def analyze(url: str):

        llms_url = urljoin(url, "/llms.txt")

        try:

            r = requests.get(
                llms_url,
                timeout=10,
                headers={
                    "User-Agent": "Mozilla/5.0"
                }
            )

            if r.status_code == 200:

                return {
                    "exists": True,
                    "url": llms_url,
                    "size": len(r.text),
                    "preview": r.text[:500]
                }

        except:
            pass

        return {
            "exists": False,
            "url": llms_url,
            "size": 0,
            "preview": ""
        }