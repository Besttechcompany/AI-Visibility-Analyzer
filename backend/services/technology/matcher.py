import re

from .models import DetectionResult


class RuleMatcher:

    @staticmethod
    def _match_rule(evidence, rule):

        rtype = rule.get("type")
        operator = rule.get("operator", "contains")
        value = str(rule.get("value", rule.get("contains", ""))).lower()

        # -----------------------------
        # Sources
        # -----------------------------

        if rtype == "html":
            target = evidence.html

        elif rtype == "title":
            target = evidence.title.lower()

        elif rtype == "generator":
            target = evidence.meta_generator

        elif rtype == "script":
            target = " ".join(evidence.scripts)

        elif rtype == "stylesheet":
            target = " ".join(evidence.stylesheets)

        elif rtype == "link":
            target = " ".join(evidence.links)

        elif rtype == "body_class":
            target = " ".join(evidence.body_classes)

        elif rtype == "html_class":
            target = " ".join(evidence.html_classes)

        elif rtype == "id":
            target = " ".join(evidence.ids)

        elif rtype == "jsonld":
            target = " ".join(evidence.json_ld).lower()

        elif rtype == "header":

            header = rule.get("header", "").lower()

            target = evidence.headers.get(header, "")

        elif rtype == "meta":

            meta = rule.get("meta", "").lower()

            target = evidence.meta.get(meta, "").lower()

        elif rtype == "cookie":

            cookie = rule.get("cookie", "").lower()

            target = evidence.cookies.get(cookie, "").lower()

        else:
            return False

        # -----------------------------
        # Operators
        # -----------------------------

        if operator == "contains":

            return value in target

        if operator == "equals":

            return target == value

        if operator == "starts_with":

            return target.startswith(value)

        if operator == "ends_with":

            return target.endswith(value)

        if operator == "regex":

            return re.search(value, target) is not None

        if operator == "exists":

            return bool(target)

        return False

    @classmethod
    def match(cls, evidence, fingerprint):

        evidence_found = []

        score = 0

        for rule in fingerprint.get("rules", []):

            if cls._match_rule(evidence, rule):

                evidence_found.append(

                    rule.get(
                        "name",
                        rule.get(
                            "type",
                            "rule"
                        )
                    )

                )

                score += rule.get(
                    "weight",
                    20
                )

        if score == 0:

            return None

        confidence = min(score, 100)

        return DetectionResult(

            technology=fingerprint["technology"],

            category=fingerprint["category"],

            confidence=confidence,

            evidence=evidence_found

        )