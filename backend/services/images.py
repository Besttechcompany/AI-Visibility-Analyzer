from bs4 import BeautifulSoup
from urllib.parse import urljoin


class ImageAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        images = soup.find_all("img")

        total_images = len(images)
        missing_alt = 0
        empty_alt = 0
        lazy_loaded = 0
        image_urls = []

        for img in images:

            src = img.get("src", "")

            if src:
                image_urls.append(
                    urljoin(url, src)
                )

            if not img.has_attr("alt"):
                missing_alt += 1

            elif img.get("alt", "").strip() == "":
                empty_alt += 1

            if (
                img.get("loading") == "lazy"
                or img.has_attr("data-src")
                or img.has_attr("data-lazy-src")
            ):
                lazy_loaded += 1

        return {

            "total": total_images,

            "missing_alt": missing_alt,

            "empty_alt": empty_alt,

            "lazy_loaded": lazy_loaded,

            "image_urls": image_urls[:10]

        }