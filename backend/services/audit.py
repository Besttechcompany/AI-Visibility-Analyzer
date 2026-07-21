from bs4 import BeautifulSoup


class AuditAnalyzer:

    @staticmethod
    def analyze(soup, html):

        audit = {}

        # Meta Description
        meta = soup.find("meta", attrs={"name": "description"})
        audit["meta_description"] = meta is not None

        # Canonical
        audit["canonical"] = soup.find("link", rel="canonical") is not None

        # Robots
        audit["robots"] = soup.find(
            "meta",
            attrs={"name": "robots"}
        ) is not None

        # H1
        audit["h1_count"] = len(soup.find_all("h1"))

        # Images
        images = soup.find_all("img")

        audit["images"] = len(images)

        audit["images_without_alt"] = sum(
            1
            for img in images
            if not img.get("alt")
        )

        # Internal Links
        links = soup.find_all("a")

        audit["total_links"] = len(links)

        return audit