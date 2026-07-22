import json
from bs4 import BeautifulSoup

from .models import Evidence


class EvidenceCollector:

    @staticmethod
    def collect(response, soup):

        scripts = [
            s.get("src", "").lower()
            for s in soup.find_all("script", src=True)
        ]

        stylesheets = [
            l.get("href", "").lower()
            for l in soup.find_all(
                "link",
                rel=lambda r: r and "stylesheet" in r
            )
        ]

        links = [
            l.get("href", "").lower()
            for l in soup.find_all("link", href=True)
        ]

        body_classes = []

        if soup.body:
            body_classes = [
                c.lower()
                for c in soup.body.get("class", [])
            ]

        html_classes = []

        if soup.html:
            html_classes = [
                c.lower()
                for c in soup.html.get("class", [])
            ]

        ids = []

        for tag in soup.find_all(id=True):
            ids.append(tag["id"].lower())

        generator = ""

        tag = soup.find(
            "meta",
            attrs={"name": "generator"}
        )

        if tag:
            generator = tag.get("content", "").lower()

        meta = {}

        for m in soup.find_all("meta"):

            key = (
                m.get("name")
                or m.get("property")
            )

            if key:

                meta[key.lower()] = m.get(
                    "content",
                    ""
                )

        cookies = {
            c.name.lower(): c.value
            for c in response.cookies
        }

        json_ld = []

        for script in soup.find_all(
            "script",
            type="application/ld+json"
        ):
            json_ld.append(script.text)

        return Evidence(

            html=response.text.lower(),

            headers={
                k.lower(): v.lower()
                for k, v in response.headers.items()
            },

            scripts=scripts,

            stylesheets=stylesheets,

            links=links,

            body_classes=body_classes,

            html_classes=html_classes,

            ids=ids,

            meta=meta,

            meta_generator=generator,

            cookies=cookies,

            response_url=response.url,

            title=soup.title.string if soup.title else "",

            json_ld=json_ld
        )