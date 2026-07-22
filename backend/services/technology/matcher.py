from .models import TechnologyMatch


class RuleMatcher:

    @staticmethod
    def match(evidence, fingerprint):

        matched = []

        rules = fingerprint.get("rules", [])

        if not rules:
            return None

        for rule in rules:

            rule_type = rule.get("type", "").lower()
            contains = rule.get("contains", "").lower()

            # HTML
            if rule_type == "html":

                if contains in evidence.html:
                    matched.append("html")

            # Scripts
            elif rule_type == "script":

                if any(contains in s for s in evidence.scripts):
                    matched.append("script")

            # Stylesheets
            elif rule_type == "stylesheet":

                if any(contains in s for s in evidence.stylesheets):
                    matched.append("stylesheet")

            # Meta Tags
            elif rule_type == "meta":

                for key, value in evidence.meta.items():

                    key = str(key).lower()
                    value = str(value).lower()

                    if contains in key or contains in value:
                        matched.append("meta")
                        break

            # Headers
            elif rule_type == "header":

                header = rule.get("header", "").lower()

                if header in evidence.headers:

                    if contains in evidence.headers[header].lower():
                        matched.append("header")

            # Cookies
            elif rule_type == "cookie":

                if any(
                    contains in cookie
                    for cookie in evidence.cookies.keys()
                ):
                    matched.append("cookie")

            # Local Storage
            elif rule_type == "local_storage":

                if any(
                    contains in key
                    for key in evidence.local_storage.keys()
                ):
                    matched.append("local_storage")

            # Session Storage
            elif rule_type == "session_storage":

                if any(
                    contains in key
                    for key in evidence.session_storage.keys()
                ):
                    matched.append("session_storage")

            # JavaScript Globals
            elif rule_type == "javascript_global":

                if any(
                    contains == js.lower()
                    for js in evidence.javascript_globals
                ):
                    matched.append("javascript_global")

            # Network Requests
            elif rule_type == "network":

                if any(
                    contains in request
                    for request in evidence.network_requests
                ):
                    matched.append("network")

            # URL
            elif rule_type == "url":

                if contains in evidence.final_url.lower():
                    matched.append("url")

        if not matched:
            return None

        confidence = int(
            (len(matched) / len(rules)) * 100
        )

        confidence = min(confidence, 100)

        return TechnologyMatch(

            technology=fingerprint["technology"],

            category=fingerprint["category"],

            confidence=confidence,

            evidence=matched

        )