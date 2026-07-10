from bs4 import BeautifulSoup


class PerplexityAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        score = 100

        recommendations = []

        author = soup.find(
            "meta",
            attrs={"name": "author"}
        )

        if author is None:

            score -= 15

            recommendations.append(
                "Add Author Meta Tag"
            )

        schema = soup.find(
            "script",
            attrs={
                "type": "application/ld+json"
            }
        )

        if schema is None:

            score -= 10

            recommendations.append(
                "Add Structured Data"
            )

        return {

            "score": score,

            "author": author is not None,

            "schema": schema is not None,

            "recommendations": recommendations

        }