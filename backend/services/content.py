import re

from bs4 import BeautifulSoup


class ContentAnalyzer:

    @staticmethod
    def analyze(soup: BeautifulSoup):

        # Remove unwanted tags
        for tag in soup([
            "script",
            "style",
            "noscript",
            "svg"
        ]):
            tag.decompose()

        text = soup.get_text(separator=" ")

        text = re.sub(r"\s+", " ", text).strip()

        words = text.split()

        word_count = len(words)

        characters = len(text)

        paragraphs = len(soup.find_all("p"))

        headings = len(
            soup.find_all([
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6"
            ])
        )

        sentences = len(
            re.findall(r"[.!?]+", text)
        )

        reading_time = max(
            1,
            round(word_count / 200)
        )

        average_words_sentence = round(
            word_count / sentences,
            2
        ) if sentences else 0

        thin_content = word_count < 300

        return {

            "word_count": word_count,

            "characters": characters,

            "paragraphs": paragraphs,

            "headings": headings,

            "sentences": sentences,

            "reading_time_minutes": reading_time,

            "average_words_per_sentence":
                average_words_sentence,

            "thin_content": thin_content

        }