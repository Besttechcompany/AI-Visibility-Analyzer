from bs4 import BeautifulSoup


class DeepSeekAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        score = 100
        recommendations = []

        # ---------------------------------
        # Website Content
        # ---------------------------------

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        words = len(text.split())

        if words < 600:

            score -= 15

            recommendations.append(
                "Increase useful textual content and topical depth."
            )

        # ---------------------------------
        # Title
        # ---------------------------------

        if not soup.title:

            score -= 10

            recommendations.append(
                "Add a descriptive page title."
            )

        # ---------------------------------
        # H1
        # ---------------------------------

        h1_count = len(
            soup.find_all("h1")
        )

        if h1_count == 0:

            score -= 10

            recommendations.append(
                "Add a clear primary H1 heading."
            )

        elif h1_count > 1:

            score -= 5

            recommendations.append(
                "Use one primary H1 heading per page."
            )

        # ---------------------------------
        # H2 / H3 Structure
        # ---------------------------------

        headings = len(
            soup.find_all([
                "h2",
                "h3"
            ])
        )

        if headings < 3:

            score -= 10

            recommendations.append(
                "Improve content structure with H2 and H3 headings."
            )

        # ---------------------------------
        # Schema
        # ---------------------------------

        schema = soup.find_all(
            "script",
            attrs={
                "type": "application/ld+json"
            }
        )

        if not schema:

            score -= 10

            recommendations.append(
                "Add structured data to improve machine understanding."
            )

        # ---------------------------------
        # Author / Expertise
        # ---------------------------------

        author = soup.find(
            "meta",
            attrs={"name": "author"}
        )

        if not author:

            score -= 5

            recommendations.append(
                "Add author information to strengthen content credibility."
            )

        # ---------------------------------
        # Final Score
        # ---------------------------------

        score = max(0, min(score, 100))

        return {

            "score": score,

            "word_count": words,

            "headings": headings,

            "schema": bool(schema),

            "author": author is not None,

            "recommendations": recommendations

        }