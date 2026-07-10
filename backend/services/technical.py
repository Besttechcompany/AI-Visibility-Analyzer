import requests
from bs4 import BeautifulSoup


class TechnicalAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        try:
            robots = requests.get(
                url.rstrip("/") + "/robots.txt",
                timeout=10
            )
            robots_txt = robots.status_code == 200

        except:
            robots_txt = False

        try:
            sitemap = requests.get(
                url.rstrip("/") + "/sitemap.xml",
                timeout=10
            )
            sitemap_xml = sitemap.status_code == 200

        except:
            sitemap_xml = False

        favicon = soup.find(
            "link",
            rel=lambda x: x and "icon" in x.lower()
        )

        viewport = soup.find(
            "meta",
            attrs={"name": "viewport"}
        )

        charset = soup.find(
            "meta",
            charset=True
        )

        ssl = url.startswith("https://")

        return {

            "ssl": ssl,
            "robots_txt": robots_txt,
            "sitemap_xml": sitemap_xml,
            "favicon": favicon is not None,
            "viewport": viewport is not None,
            "charset": charset.get("charset") if charset else "Not Found"

        }