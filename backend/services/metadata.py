from bs4 import BeautifulSoup


class MetadataExtractor:

    @staticmethod
    def extract(soup: BeautifulSoup):

        title = (
            soup.title.string.strip()
            if soup.title and soup.title.string
            else ""
        )

        description = ""

        tag = soup.find(
            "meta",
            attrs={"name": "description"}
        )

        if tag:
            description = tag.get("content", "")

        canonical = ""

        tag = soup.find(
            "link",
            rel="canonical"
        )

        if tag:
            canonical = tag.get("href", "")

        robots = ""

        tag = soup.find(
            "meta",
            attrs={"name": "robots"}
        )

        if tag:
            robots = tag.get("content", "")

        language = ""

        if soup.html:
            language = soup.html.get("lang", "")

        return {
            "title": title,
            "meta_description": description,
            "canonical": canonical,
            "robots": robots,
            "language": language
        }