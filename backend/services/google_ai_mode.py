from bs4 import BeautifulSoup


class GoogleAIModeAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        score = 100
        recommendations = []

        # ---------------------------------
        # Title
        # ---------------------------------

        title = soup.title

        if not title:

            score -= 10

            recommendations.append(
                "Add a clear page title."
            )

        # ---------------------------------
        # Meta Description
        # ---------------------------------

        description = soup.find(
            "meta",
            attrs={
                "name": "description"
            }
        )

        if not description:

            score -= 10

            recommendations.append(
                "Add a useful meta description."
            )

        # ---------------------------------
        # H1
        # ---------------------------------

        h1 = soup.find_all("h1")

        if len(h1) == 0:

            score -= 10

            recommendations.append(
                "Add a clear H1 heading."
            )

        # ---------------------------------
        # Content Depth
        # ---------------------------------

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        words = len(text.split())

        if words < 500:

            score -= 15

            recommendations.append(
                "Increase useful content depth."
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

        if not schema:

            score -= 15

            recommendations.append(
                "Add Schema.org structured data."
            )

        # ---------------------------------
        # Semantic Headings
        # ---------------------------------

        headings = soup.find_all([
            "h2",
            "h3"
        ])

        if len(headings) < 3:

            score -= 10

            recommendations.append(
                "Improve semantic content structure with H2 and H3 headings."
            )

        # ---------------------------------
        # Canonical
        # ---------------------------------

        canonical = soup.find(
            "link",
            rel="canonical"
        )

        if not canonical:

            score -= 10

            recommendations.append(
                "Add a canonical URL."
            )

        # ---------------------------------
        # Final Score
        # ---------------------------------

        score = max(0, min(score, 100))

        return {

            "score": score,

            "word_count": words,

            "schema": bool(schema),

            "canonical": canonical is not None,

            "recommendations": recommendations

        }