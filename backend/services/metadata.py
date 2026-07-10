from bs4 import BeautifulSoup


class MetadataAnalyzer:

    @staticmethod
    def analyze(soup: BeautifulSoup):

        def get_meta(name=None, property=None):

            if name:
                tag = soup.find(
                    "meta",
                    attrs={"name": name}
                )

                if tag:
                    return tag.get("content", "")

            if property:
                tag = soup.find(
                    "meta",
                    attrs={"property": property}
                )

                if tag:
                    return tag.get("content", "")

            return ""

        author = get_meta(name="author")

        keywords = get_meta(name="keywords")

        generator = get_meta(name="generator")

        theme_color = get_meta(name="theme-color")

        publisher = get_meta(name="publisher")

        og_title = get_meta(property="og:title")

        og_description = get_meta(property="og:description")

        og_image = get_meta(property="og:image")

        og_url = get_meta(property="og:url")

        og_type = get_meta(property="og:type")

        twitter_card = get_meta(name="twitter:card")

        twitter_title = get_meta(name="twitter:title")

        twitter_description = get_meta(name="twitter:description")

        twitter_image = get_meta(name="twitter:image")

        google_verification = get_meta(
            name="google-site-verification"
        )

        ms_verification = get_meta(
            name="msvalidate.01"
        )

        yandex_verification = get_meta(
            name="yandex-verification"
        )

        apple_icon = soup.find(
            "link",
            rel=lambda x: x and "apple-touch-icon" in x
        )

        manifest = soup.find(
            "link",
            rel="manifest"
        )

        return {

            "author": author,

            "publisher": publisher,

            "keywords": keywords,

            "generator": generator,

            "theme_color": theme_color,

            "open_graph": {

                "title": og_title,

                "description": og_description,

                "image": og_image,

                "url": og_url,

                "type": og_type

            },

            "twitter": {

                "card": twitter_card,

                "title": twitter_title,

                "description": twitter_description,

                "image": twitter_image

            },

            "verification": {

                "google": google_verification,

                "bing": ms_verification,

                "yandex": yandex_verification

            },

            "apple_touch_icon": apple_icon is not None,

            "manifest": manifest is not None

        }