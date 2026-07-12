from bs4 import BeautifulSoup


class EEATAnalyzer:

    @staticmethod
    def analyze(soup: BeautifulSoup):

        text = soup.get_text(" ", strip=True).lower()

        score = 100

        recommendations = []

        has_author = bool(
            soup.find("meta", attrs={"name": "author"})
        )

        has_about = "about" in text

        has_contact = "contact" in text

        has_privacy = "privacy" in text

        has_terms = "terms" in text

        if not has_author:
            score -= 15
            recommendations.append(
                "Add author information."
            )

        if not has_about:
            score -= 10
            recommendations.append(
                "Create a clear About page."
            )

        if not has_contact:
            score -= 10
            recommendations.append(
                "Provide complete contact information."
            )

        if not has_privacy:
            score -= 5
            recommendations.append(
                "Add a Privacy Policy."
            )

        if not has_terms:
            score -= 5
            recommendations.append(
                "Add Terms and Conditions."
            )

        return {

            "score": score,

            "author": has_author,

            "about": has_about,

            "contact": has_contact,

            "privacy": has_privacy,

            "terms": has_terms,

            "recommendations": recommendations

        }