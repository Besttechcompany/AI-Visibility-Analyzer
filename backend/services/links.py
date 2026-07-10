import requests

from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


class LinkAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        links = soup.find_all("a")

        total_links = len(links)

        internal_links = 0
        external_links = 0

        nofollow_links = 0

        mailto_links = 0
        tel_links = 0

        broken_links = 0

        internal_urls = []
        external_urls = []

        domain = urlparse(url).netloc

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        for link in links:

            href = link.get("href")

            if not href:
                continue

            href = href.strip()

            if href.startswith("mailto:"):
                mailto_links += 1
                continue

            if href.startswith("tel:"):
                tel_links += 1
                continue

            absolute_url = urljoin(url, href)

            parsed = urlparse(absolute_url)

            if parsed.netloc == domain:
                internal_links += 1

                if len(internal_urls) < 10:
                    internal_urls.append(absolute_url)

            else:
                external_links += 1

                if len(external_urls) < 10:
                    external_urls.append(absolute_url)

            rel = link.get("rel", [])

            if "nofollow" in rel:
                nofollow_links += 1

            try:

                r = requests.head(
                    absolute_url,
                    headers=headers,
                    allow_redirects=True,
                    timeout=5
                )

                if r.status_code >= 400:
                    broken_links += 1

            except:
                broken_links += 1

        return {

            "total": total_links,

            "internal_links": internal_links,

            "external_links": external_links,

            "nofollow_links": nofollow_links,

            "mailto_links": mailto_links,

            "tel_links": tel_links,

            "broken_links": broken_links,

            "internal_urls": internal_urls,

            "external_urls": external_urls

        }