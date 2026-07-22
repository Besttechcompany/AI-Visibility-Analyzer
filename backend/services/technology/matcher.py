from .models import DetectionResult


class RuleMatcher:

    @staticmethod
    def match(evidence, fingerprint):

        score = 0

        matched = []

        total_rules = len(
            fingerprint["rules"]
        )

        for rule in fingerprint["rules"]:

            rtype = rule["type"]

            value = rule.get(
                "contains",
                ""
            ).lower()

            # -----------------------
            # META GENERATOR
            # -----------------------

            if rtype == "meta_generator":

                if value in evidence.meta_generator:

                    score += 1

                    matched.append(
                        "Meta Generator"
                    )

            # -----------------------
            # HTML
            # -----------------------

            elif rtype == "html":

                if value in evidence.html:

                    score += 1

                    matched.append(value)

            # -----------------------
            # Script
            # -----------------------

            elif rtype == "script":

                if any(
                    value in s
                    for s in evidence.scripts
                ):

                    score += 1

                    matched.append(value)

            # -----------------------
            # Stylesheet
            # -----------------------

            elif rtype == "stylesheet":

                if any(
                    value in s
                    for s in evidence.stylesheets
                ):

                    score += 1

                    matched.append(value)

            # -----------------------
            # Header
            # -----------------------

            elif rtype == "header":

                header = rule["header"].lower()

                if header in evidence.headers:

                    if value in evidence.headers[header]:

                        score += 1

                        matched.append(
                            header
                        )

            # -----------------------
            # Cookie
            # -----------------------

            elif rtype == "cookie":

                if value in evidence.cookies:

                    score += 1

                    matched.append(
                        value
                    )

        if score == 0:

            return None

        confidence = round(

            (score / total_rules) * 100

        )

        return DetectionResult(

            technology=fingerprint["technology"],

            category=fingerprint["category"],

            confidence=confidence,

            evidence=matched

        )