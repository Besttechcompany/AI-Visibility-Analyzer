import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


class TechnicalSEOAnalyzer:

    @staticmethod
    def analyze(url, response, soup):

        technical = {}

        # ------------------------
        # HTTPS
        # ------------------------

        technical["https"] = url.lower().startswith("https://")

        # ------------------------
        # Status Code
        # ------------------------

        technical["status_code"] = response.status_code

        # ------------------------
        # Response Time (ms)
        # ------------------------

        technical["response_time_ms"] = round(
            response.elapsed.total_seconds() * 1000,
            2
        )

        # ------------------------
        # Page Size (KB)
        # ------------------------

        technical["page_size_kb"] = round(
            len(response.content) / 1024,
            2
        )

        # ------------------------
        # Redirect
        # ------------------------

        technical["redirected"] = (
            response.url.rstrip("/") != url.rstrip("/")
        )

        technical["final_url"] = response.url

        # ------------------------
        # robots.txt
        # ------------------------

        robots_url = urljoin(url, "/robots.txt")

        try:
            r = requests.get(
                robots_url,
                timeout=10,
                allow_redirects=True
            )

            technical["robots_txt"] = (
                r.status_code == 200
            )

        except Exception:
            technical["robots_txt"] = False

        # ------------------------
        # sitemap.xml
        # ------------------------

        sitemap_url = urljoin(url, "/sitemap.xml")

        try:
            r = requests.get(
                sitemap_url,
                timeout=10,
                allow_redirects=True
            )

            technical["sitemap"] = (
                r.status_code == 200
            )

        except Exception:
            technical["sitemap"] = False

        # ------------------------
        # Open Graph
        # ------------------------

        og = {}

        for tag in soup.find_all("meta", property=True):

            prop = tag.get("property", "")

            if prop.startswith("og:"):

                og[prop] = tag.get(
                    "content",
                    ""
                )

        technical["open_graph"] = og

        technical["open_graph_summary"] = {

            "exists": len(og) > 0,

            "title": "og:title" in og,

            "description": "og:description" in og,

            "image": "og:image" in og,

            "url": "og:url" in og,

            "site_name": "og:site_name" in og

        }

        # ------------------------
        # Twitter Cards
        # ------------------------

        twitter = {}

        for tag in soup.find_all(
            "meta",
            attrs={"name": True}
        ):

            name = tag.get("name", "")

            if name.startswith("twitter:"):

                twitter[name] = tag.get(
                    "content",
                    ""
                )

        technical["twitter_cards"] = twitter

        technical["twitter_summary"] = {

            "exists": len(twitter) > 0,

            "card": twitter.get(
                "twitter:card",
                ""
            )

        }

        # ------------------------
        # Favicon
        # ------------------------

        favicon = soup.find(
            "link",
            rel=lambda x: x and "icon" in x.lower()
        )

        technical["favicon"] = (
            urljoin(
                response.url,
                favicon.get("href")
            )
            if favicon and favicon.get("href")
            else ""
        )

        # ------------------------
        # JSON-LD
        # ------------------------

        schemas = soup.find_all(
            "script",
            attrs={
                "type": "application/ld+json"
            }
        )

        technical["json_ld_count"] = len(schemas)

        technical["structured_data"] = (
            len(schemas) > 0
        )

        return technical