from bs4 import BeautifulSoup


class GeminiAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        score = 100

        recommendations = []

        if not soup.find("link", rel="canonical"):

            score -= 10

            recommendations.append(
                "Missing Canonical URL"
            )

        if not soup.find(
            "meta",
            attrs={"property": "og:title"}
        ):

            score -= 10

            recommendations.append(
                "Missing OpenGraph Tags"
            )

        return {

            "score": score,

            "knowledge_graph": True,

            "recommendations": recommendations

        }