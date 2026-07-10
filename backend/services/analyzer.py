import requests

from bs4 import BeautifulSoup

from services.technical import TechnicalAnalyzer
from services.images import ImageAnalyzer
from services.links import LinkAnalyzer
from services.metadata import MetadataAnalyzer
from services.schema import SchemaAnalyzer


class WebsiteAnalyzer:

    @staticmethod
    def analyze(url: str):

        try:

            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/137.0 Safari/537.36"
                )
            }

            response = requests.get(
                url,
                headers=headers,
                timeout=20,
                allow_redirects=True
            )

            response.raise_for_status()

            soup = BeautifulSoup(
                response.text,
                "lxml"
            )

            # -----------------------------
            # Basic SEO
            # -----------------------------

            title = (
                soup.title.string.strip()
                if soup.title and soup.title.string
                else "Not Found"
            )

            meta_description = ""

            description = soup.find(
                "meta",
                attrs={"name": "description"}
            )

            if description:
                meta_description = description.get(
                    "content",
                    ""
                )

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
                canonical = canonical_tag.get(
                    "href",
                    ""
                )

            robots = ""

            robots_tag = soup.find(
                "meta",
                attrs={"name": "robots"}
            )

            if robots_tag:
                robots = robots_tag.get(
                    "content",
                    ""
                )

            h1 = [
                h.get_text(strip=True)
                for h in soup.find_all("h1")
            ]

            h2 = [
                h.get_text(strip=True)
                for h in soup.find_all("h2")
            ]

            # -----------------------------
            # Module Calls
            # -----------------------------

            technical = TechnicalAnalyzer.analyze(
                url,
                soup
            )

            images = ImageAnalyzer.analyze(
                url,
                soup
            )

            links = LinkAnalyzer.analyze(
                url,
                soup
            )

            metadata = MetadataAnalyzer.analyze(
                soup
            )
            schema = SchemaAnalyzer.analyze(
    soup
)

            return {

                "success": True,

                "title": title,

                "meta_description": meta_description,

                "language": language,

                "canonical": canonical,

                "robots": robots,

                "h1": h1,

                "h2": h2,

                "technical": technical,

                "images": images,

                "links": links,

                "metadata": metadata,
                
                "schema": schema

            }

        except Exception as e:

            return {

                "success": False,

                "error": str(e)

            }