import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


class WebsiteAnalyzer:

    @staticmethod
    def exists(url):
        try:
            r = requests.get(
                url,
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=10,
                allow_redirects=True
            )
            return r.status_code == 200
        except:
            return False

    @staticmethod
    def analyze(url: str):

        try:

            headers = {
                "User-Agent": "Mozilla/5.0"
            }

            response = requests.get(
                url,
                headers=headers,
                timeout=15
            )

            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")

            # -----------------------------
            # Basic SEO
            # -----------------------------

            title = (
                soup.title.string.strip()
                if soup.title and soup.title.string
                else "Not Found"
            )

            description = ""

            meta = soup.find(
                "meta",
                attrs={"name": "description"}
            )

            if meta:
                description = meta.get("content", "")

            language = (
                soup.html.get("lang")
                if soup.html
                else ""
            )

            canonical = ""

            canonical_tag = soup.find(
                "link",
                rel="canonical"
            )

            if canonical_tag:
                canonical = canonical_tag.get("href", "")

            robots = ""

            robots_tag = soup.find(
                "meta",
                attrs={"name": "robots"}
            )

            if robots_tag:
                robots = robots_tag.get("content", "")

            h1 = [
                tag.get_text(strip=True)
                for tag in soup.find_all("h1")
            ]

            h2 = [
                tag.get_text(strip=True)
                for tag in soup.find_all("h2")
            ]

            # -----------------------------
            # Technical SEO
            # -----------------------------

            robots_txt = WebsiteAnalyzer.exists(
                urljoin(url, "/robots.txt")
            )

            sitemap_xml = WebsiteAnalyzer.exists(
                urljoin(url, "/sitemap.xml")
            )

            favicon = soup.find(
                "link",
                rel=lambda x: x and "icon" in x.lower()
            )

            viewport = soup.find(
                "meta",
                attrs={"name": "viewport"}
            )

            charset = soup.find(
                "meta",
                charset=True
            )

            ssl = url.startswith("https://")

            # -----------------------------
            # Image SEO
            # -----------------------------

            images = soup.find_all("img")

            total_images = len(images)

            missing_alt = 0
            empty_alt = 0
            lazy_loaded = 0

            image_urls = []

            for img in images:

                src = img.get("src", "")

                if src:
                    image_urls.append(
                        urljoin(url, src)
                    )

                if not img.has_attr("alt"):
                    missing_alt += 1

                elif img.get("alt", "").strip() == "":
                    empty_alt += 1

                if (
                    img.get("loading") == "lazy"
                    or img.has_attr("data-src")
                    or img.has_attr("data-lazy-src")
                ):
                    lazy_loaded += 1

            # -----------------------------
            # Links SEO
            # -----------------------------

            links = soup.find_all("a")

            total_links = len(links)

            internal_links = 0
            external_links = 0

            nofollow_links = 0

            mailto_links = 0
            tel_links = 0

            broken_links = 0

            internal_urls = []
            external_urls = []

            domain = urlparse(url).netloc

            for link in links:

                href = link.get("href")

                if not href:
                    continue

                href = href.strip()

                if href.startswith("mailto:"):
                    mailto_links += 1
                    continue

                if href.startswith("tel:"):
                    tel_links += 1
                    continue

                absolute_url = urljoin(url, href)

                parsed = urlparse(absolute_url)

                if parsed.netloc == domain:
                    internal_links += 1

                    if len(internal_urls) < 10:
                        internal_urls.append(absolute_url)

                else:
                    external_links += 1

                    if len(external_urls) < 10:
                        external_urls.append(absolute_url)

                rel = link.get("rel", [])

                if "nofollow" in rel:
                    nofollow_links += 1

                try:

                    r = requests.head(
                        absolute_url,
                        headers=headers,
                        allow_redirects=True,
                        timeout=5
                    )

                    if r.status_code >= 400:
                        broken_links += 1

                except:
                    broken_links += 1

            # -----------------------------
            # Final Response
            # -----------------------------

            return {

                "success": True,

                "title": title,

                "meta_description": description,

                "language": language,

                "canonical": canonical,

                "robots": robots,

                "h1": h1,

                "h2": h2,

                "technical": {

                    "ssl": ssl,

                    "robots_txt": robots_txt,

                    "sitemap_xml": sitemap_xml,

                    "favicon": favicon is not None,

                    "viewport": viewport is not None,

                    "charset": charset.get("charset") if charset else "Not Found"

                },

                "images": {

                    "total": total_images,

                    "missing_alt": missing_alt,

                    "empty_alt": empty_alt,

                    "lazy_loaded": lazy_loaded,

                    "image_urls": image_urls[:10]

                },

                "links": {

                    "total": total_links,

                    "internal_links": internal_links,

                    "external_links": external_links,

                    "nofollow_links": nofollow_links,

                    "mailto_links": mailto_links,

                    "tel_links": tel_links,

                    "broken_links": broken_links,

                    "internal_urls": internal_urls,

                    "external_urls": external_urls

                }

            }

        except Exception as e:

            return {

                "success": False,

                "error": str(e)

            }