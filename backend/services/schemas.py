import json

from bs4 import BeautifulSoup


class SchemaAnalyzer:

    @staticmethod
    def analyze(soup: BeautifulSoup):

        json_ld_scripts = soup.find_all(
            "script",
            attrs={"type": "application/ld+json"}
        )

        schema_types = []

        for script in json_ld_scripts:

            try:

                data = json.loads(script.string)

                if isinstance(data, list):

                    for item in data:

                        if "@type" in item:
                            schema_types.append(item["@type"])

                elif isinstance(data, dict):

                    if "@type" in data:
                        schema_types.append(data["@type"])

            except Exception:
                pass

        microdata = len(
            soup.find_all(attrs={"itemscope": True})
        )

        rdfa = len(
            soup.find_all(attrs={"typeof": True})
        )

        return {

            "found": len(json_ld_scripts) > 0,

            "json_ld": len(json_ld_scripts),

            "types": list(set(schema_types)),

            "organization": "Organization" in schema_types,

            "website": "WebSite" in schema_types,

            "breadcrumb": "BreadcrumbList" in schema_types,

            "faq": "FAQPage" in schema_types,

            "article": "Article" in schema_types,

            "product": "Product" in schema_types,

            "person": "Person" in schema_types,

            "service": "Service" in schema_types,

            "local_business": "LocalBusiness" in schema_types,

            "microdata": microdata,

            "rdfa": rdfa

        }