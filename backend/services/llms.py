import requests
from urllib.parse import urljoin


class LLMAnalyzer:

    @staticmethod
    def analyze(url: str):

        llms_url = urljoin(url, "/llms.txt")

        try:

            response = requests.get(
                llms_url,
                timeout=10,
                headers={
                    "User-Agent": "Mozilla/5.0"
                }
            )

            if response.status_code == 200:

                return {

                    "exists": True,

                    "url": llms_url,

                    "size": len(response.text),

                    "preview": response.text[:500]

                }

        except Exception:
            pass

        return {

            "exists": False,

            "url": llms_url,

            "size": 0,

            "preview": ""

        }