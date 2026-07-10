from bs4 import BeautifulSoup


class ChatGPTAnalyzer:

    @staticmethod
    def analyze(url: str, soup: BeautifulSoup):

        score = 100

        recommendations = []

        # -------------------------
        # Meta Description
        # -------------------------

        meta = soup.find(
            "meta",
            attrs={"name": "description"}
        )

        if not meta:
            score -= 10
            recommendations.append(
                "Add a meta description."
            )

        # -------------------------
        # H1
        # -------------------------

        h1 = soup.find_all("h1")

        if len(h1) == 0:
            score -= 10
            recommendations.append(
                "Add at least one H1 heading."
            )

        # -------------------------
        # Schema
        # -------------------------

        schema = soup.find_all(
            "script",
            attrs={
                "type": "application/ld+json"
            }
        )

        if len(schema) == 0:
            score -= 15
            recommendations.append(
                "Add JSON-LD structured data."
            )

        # -------------------------
        # Images Alt
        # -------------------------

        images = soup.find_all("img")

        missing_alt = 0

        for img in images:

            if not img.has_attr("alt"):

                missing_alt += 1

        if missing_alt > 0:

            score -= 5

            recommendations.append(
                "Some images are missing alt text."
            )

        # -------------------------
        # Content
        # -------------------------

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        words = len(text.split())

        if words < 500:

            score -= 15

            recommendations.append(
                "Increase page content."
            )

        # -------------------------
        # FAQ
        # -------------------------

        faq = False

        for s in schema:

            if s.string and "FAQPage" in s.string:

                faq = True

                break

        if not faq:

            score -= 5

            recommendations.append(
                "Add FAQ schema."
            )

        # -------------------------
        # Canonical
        # -------------------------

        canonical = soup.find(
            "link",
            rel="canonical"
        )

        if canonical is None:

            score -= 5

            recommendations.append(
                "Add canonical URL."
            )

        if score < 0:

            score = 0

        return {

            "score": score,

            "meta_description": meta is not None,

            "h1": len(h1),

            "schema": len(schema) > 0,

            "faq_schema": faq,

            "images_with_missing_alt": missing_alt,

            "word_count": words,

            "recommendations": recommendations

        }