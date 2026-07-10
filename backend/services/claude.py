from bs4 import BeautifulSoup


class ClaudeAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        words = len(text.split())

        headings = len(
            soup.find_all([
                "h1",
                "h2",
                "h3"
            ])
        )

        score = 100

        recommendations = []

        if words < 800:

            score -= 20

            recommendations.append(
                "Increase content depth."
            )

        if headings < 5:

            score -= 10

            recommendations.append(
                "Use more structured headings."
            )

        return {

            "score": score,

            "word_count": words,

            "headings": headings,

            "recommendations": recommendations

        }