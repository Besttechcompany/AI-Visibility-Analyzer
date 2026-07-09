import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


class WebsiteAnalyzer:

    @staticmethod
    def exists(url):
        try:
            r = requests.get(
                url,
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=10,
                allow_redirects=True
            )
            return r.status_code == 200
        except:
            return False

    @staticmethod
    def analyze(url: str):

        try:

            headers = {
                "User-Agent": "Mozilla/5.0"
            }

            response = requests.get(
                url,
                headers=headers,
                timeout=15
            )

            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")

            title = (
                soup.title.string.strip()
                if soup.title and soup.title.string
                else "Not Found"
            )

            description = ""

            meta = soup.find(
                "meta",
                attrs={"name": "description"}
            )

            if meta:
                description = meta.get("content", "")

            language = (
                soup.html.get("lang")
                if soup.html
                else ""
            )

            canonical = ""

            canonical_tag = soup.find(
                "link",
                rel="canonical"
            )

            if canonical_tag:
                canonical = canonical_tag.get("href", "")

            robots = ""

            robots_tag = soup.find(
                "meta",
                attrs={"name": "robots"}
            )

            if robots_tag:
                robots = robots_tag.get("content", "")

            h1 = [
                tag.get_text(strip=True)
                for tag in soup.find_all("h1")
            ]

            h2 = [
                tag.get_text(strip=True)
                for tag in soup.find_all("h2")
            ]

            # -----------------------------
            # Technical SEO
            # -----------------------------

            robots_txt = WebsiteAnalyzer.exists(
                urljoin(url, "/robots.txt")
            )

            sitemap_xml = WebsiteAnalyzer.exists(
                urljoin(url, "/sitemap.xml")
            )

            favicon = soup.find("link", rel=lambda x: x and "icon" in x.lower())

            viewport = soup.find(
                "meta",
                attrs={"name": "viewport"}
            )

            charset = soup.find("meta", charset=True)

            ssl = url.startswith("https://")

            return {

                "success": True,

                "title": title,

                "meta_description": description,

                "language": language,

                "canonical": canonical,

                "robots": robots,

                "h1": h1,

                "h2": h2,

                "technical": {

                    "ssl": ssl,

                    "robots_txt": robots_txt,

                    "sitemap_xml": sitemap_xml,

                    "favicon": favicon is not None,

                    "viewport": viewport is not None,

                    "charset": charset.get("charset") if charset else "Not Found"

                }

            }

        except Exception as e:

            return {

                "success": False,

                "error": str(e)

            }