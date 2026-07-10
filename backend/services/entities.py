import re

from bs4 import BeautifulSoup


class EntityAnalyzer:

    @staticmethod
    def analyze(soup: BeautifulSoup):

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        words = re.findall(r"[A-Z][a-zA-Z]{2,}", text)

        entities = list(set(words))

        entities.sort()

        return {

            "count": len(entities),

            "top_entities": entities[:30]

        }