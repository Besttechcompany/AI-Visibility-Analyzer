import requests


class TechnicalAnalyzer:

    @staticmethod
    def robots_txt(url):

        try:
            r = requests.get(
                url.rstrip("/") + "/robots.txt",
                timeout=10
            )

            return r.status_code == 200

        except:
            return False

    @staticmethod
    def sitemap(url):

        try:
            r = requests.get(
                url.rstrip("/") + "/sitemap.xml",
                timeout=10
            )

            return r.status_code == 200

        except:
            return False