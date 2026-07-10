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

                if not script.string:
                    continue

                data = json.loads(script.string)

                # Single schema object
                if isinstance(data, dict):

                    if "@type" in data:
                        schema_types.append(data["@type"])

                    # Handle @graph
                    if "@graph" in data:

                        for item in data["@graph"]:

                            if isinstance(item, dict):

                                if "@type" in item:

                                    t = item["@type"]

                                    if isinstance(t, list):
                                        schema_types.extend(t)
                                    else:
                                        schema_types.append(t)

                # List of schema objects
                elif isinstance(data, list):

                    for item in data:

                        if isinstance(item, dict):

                            if "@type" in item:

                                t = item["@type"]

                                if isinstance(t, list):
                                    schema_types.extend(t)
                                else:
                                    schema_types.append(t)

            except Exception:
                continue

        schema_types = list(set(schema_types))

        return {

            "found": len(json_ld_scripts) > 0,

            "json_ld": len(json_ld_scripts),

            "types": schema_types,

            "organization": "Organization" in schema_types,

            "website": "WebSite" in schema_types,

            "breadcrumb": "BreadcrumbList" in schema_types,

            "faq": "FAQPage" in schema_types,

            "article": "Article" in schema_types,

            "product": "Product" in schema_types,

            "person": "Person" in schema_types,

            "service": "Service" in schema_types,

            "local_business": "LocalBusiness" in schema_types,

            "microdata": len(
                soup.find_all(attrs={"itemscope": True})
            ),

            "rdfa": len(
                soup.find_all(attrs={"typeof": True})
            )

        }