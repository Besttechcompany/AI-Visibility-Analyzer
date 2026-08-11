from bs4 import BeautifulSoup


class GrokAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        score = 100
        recommendations = []

        # ---------------------------------
        # Content
        # ---------------------------------

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        words = len(text.split())

        if words < 500:
            score -= 15

            recommendations.append(
                "Increase website content depth for better AI understanding."
            )

        # ---------------------------------
        # Title
        # ---------------------------------

        if not soup.title:

            score -= 10

            recommendations.append(
                "Add a clear and descriptive page title."
            )

        # ---------------------------------
        # Meta Description
        # ---------------------------------

        if not soup.find(
            "meta",
            attrs={"name": "description"}
        ):

            score -= 10

            recommendations.append(
                "Add a descriptive meta description."
            )

        # ---------------------------------
        # Headings
        # ---------------------------------

        if len(soup.find_all("h1")) == 0:

            score -= 10

            recommendations.append(
                "Add a clear H1 heading."
            )

        # ---------------------------------
        # Structured Data
        # ---------------------------------

        schema = soup.find_all(
            "script",
            attrs={
                "type": "application/ld+json"
            }
        )

        if len(schema) == 0:

            score -= 10

            recommendations.append(
                "Add structured data using Schema.org markup."
            )

        # ---------------------------------
        # Open Graph
        # ---------------------------------

        if not soup.find(
            "meta",
            attrs={"property": "og:title"}
        ):

            score -= 5

            recommendations.append(
                "Add Open Graph metadata."
            )

        # ---------------------------------
        # Final Score
        # ---------------------------------

        score = max(0, min(score, 100))

        return {

            "score": score,

            "word_count": words,

            "schema": len(schema) > 0,

            "recommendations": recommendations

        }