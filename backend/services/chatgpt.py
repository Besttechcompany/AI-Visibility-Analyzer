from bs4 import BeautifulSoup


class ChatGPTAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        score = 100

        recommendations = []

        if not soup.find("meta", attrs={"name": "description"}):
            score -= 10
            recommendations.append("Add Meta Description")

        if len(soup.find_all("h1")) == 0:
            score -= 10
            recommendations.append("Add H1 Heading")

        schema = soup.find_all(
            "script",
            attrs={"type": "application/ld+json"}
        )

        if len(schema) == 0:
            score -= 15
            recommendations.append("Add Schema Markup")

        return {

            "score": score,

            "schema": len(schema) > 0,

            "recommendations": recommendations

        }