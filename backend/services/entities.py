import re

from bs4 import BeautifulSoup


class EntityAnalyzer:

    STOP_WORDS = {

        "THE","AND","FOR","WITH","FROM","THIS","THAT",
        "YOUR","OUR","YOU","ARE","ALL","ABOUT",
        "HOME","CONTACT","PRIVACY","SUPPORT",
        "HELP","LOGIN","SIGN","SERVICE","SERVICES",
        "TERMS","POLICY"

    }

    @staticmethod
    def analyze(soup: BeautifulSoup):

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        words = re.findall(
            r"\b[A-Z][A-Za-z&\-]+\b",
            text
        )

        entities = []

        for word in words:

            if len(word) < 3:
                continue

            if word.upper() in EntityAnalyzer.STOP_WORDS:
                continue

            entities.append(word)

        entities = sorted(
            list(set(entities))
        )

        organizations = []

        services = []

        topics = []

        SERVICE_WORDS = [

            "Research",
            "Publication",
            "Patent",
            "Journal",
            "Writing",
            "Paper",
            "Thesis",
            "Consultancy",
            "Consulting",
            "Analysis",
            "Training"

        ]

        TOPIC_WORDS = [

            "PhD",
            "University",
            "Research",
            "Science",
            "Engineering",
            "Technology",
            "Data",
            "AI",
            "Education"

        ]

        for entity in entities:

            if "India" in entity:

                organizations.append(entity)

            if entity in SERVICE_WORDS:

                services.append(entity)

            if entity in TOPIC_WORDS:

                topics.append(entity)

        return {

            "count": len(entities),

            "organizations": organizations,

            "services": services,

            "topics": topics,

            "top_entities": entities[:40]

        }