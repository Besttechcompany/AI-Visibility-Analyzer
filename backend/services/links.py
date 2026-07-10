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

        checked_urls = set()

        domain = urlparse(url).netloc

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/137.0 Safari/537.36"
            )
        }

        for link in links:

            href = link.get("href")

            if not href:
                continue

            href = href.strip()

            # Skip anchor links
            if href.startswith("#"):
                continue

            # Skip JavaScript links
            if href.lower().startswith("javascript:"):
                continue

            # Mail links
            if href.startswith("mailto:"):
                mailto_links += 1
                continue

            # Telephone links
            if href.startswith("tel:"):
                tel_links += 1
                continue

            absolute_url = urljoin(url, href)

            parsed = urlparse(absolute_url)

            # Internal Links
            if parsed.netloc == domain:

                internal_links += 1

                if len(internal_urls) < 10:
                    internal_urls.append(absolute_url)

                # Avoid checking the same URL multiple times
                if absolute_url in checked_urls:
                    continue

                checked_urls.add(absolute_url)

                try:

                    r = requests.head(
                        absolute_url,
                        headers=headers,
                        allow_redirects=True,
                        timeout=5
                    )

                    # Some servers block HEAD requests
                    if r.status_code in (403, 405):

                        r = requests.get(
                            absolute_url,
                            headers=headers,
                            allow_redirects=True,
                            timeout=5,
                            stream=True
                        )

                    if r.status_code >= 400:
                        broken_links += 1

                except Exception:
                    broken_links += 1

            # External Links
            else:

                external_links += 1

                if len(external_urls) < 10:
                    external_urls.append(absolute_url)

            # Nofollow
            rel = link.get("rel", [])

            if "nofollow" in rel:
                nofollow_links += 1

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