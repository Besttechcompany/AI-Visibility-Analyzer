from bs4 import BeautifulSoup

from .models import Evidence


class EvidenceCollector:

    @staticmethod
    def collect(response, soup):

        scripts = []

        for script in soup.find_all("script", src=True):
            scripts.append(script["src"].lower())

        stylesheets = []

        for css in soup.find_all("link", href=True):

            stylesheets.append(
                css["href"].lower()
            )

        generator = ""

        meta = soup.find(
            "meta",
            attrs={
                "name": "generator"
            }
        )

        if meta:

            generator = meta.get(
                "content",
                ""
            ).lower()

        meta_tags = {}

        for m in soup.find_all("meta"):

            name = m.get("name")

            prop = m.get("property")

            key = name or prop

            if key:

                meta_tags[key.lower()] = m.get(
                    "content",
                    ""
                )

        cookies = {}

        for cookie in response.cookies:

            cookies[cookie.name.lower()] = cookie.value

        return Evidence(

            html=response.text.lower(),

            headers={
                k.lower(): v.lower()
                for k, v in response.headers.items()
            },

            scripts=scripts,

            stylesheets=stylesheets,

            meta_generator=generator,

            meta=meta_tags,

            cookies=cookies,

            response_url=response.url

        )