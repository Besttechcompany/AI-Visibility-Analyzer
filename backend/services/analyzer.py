import requests
from bs4 import BeautifulSoup

from services.llms import LLMAnalyzer
from services.chatgpt import ChatGPTAnalyzer
from services.gemini import GeminiAnalyzer
from services.claude import ClaudeAnalyzer
from services.perplexity import PerplexityAnalyzer


class WebsiteAnalyzer:

    @staticmethod
    def analyze(url: str):

        try:

            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/137.0 Safari/537.36"
                )
            }

            response = requests.get(
                url,
                headers=headers,
                timeout=20,
                allow_redirects=True
            )

            response.raise_for_status()

            soup = BeautifulSoup(
                response.text,
                "lxml"
            )

            title = (
                soup.title.string.strip()
                if soup.title and soup.title.string
                else ""
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
                canonical = canonical_tag.get(
                    "href",
                    ""
                )

            robots = ""

            robots_tag = soup.find(
                "meta",
                attrs={"name": "robots"}
            )

            if robots_tag:
                robots = robots_tag.get(
                    "content",
                    ""
                )

            h1 = [
                h.get_text(strip=True)
                for h in soup.find_all("h1")
            ]

            h2 = [
                h.get_text(strip=True)
                for h in soup.find_all("h2")
            ]

            # ------------------------
            # AI Modules
            # ------------------------

            llms = LLMAnalyzer.analyze(url)

            chatgpt = ChatGPTAnalyzer.analyze(
                url,
                soup
            )

            gemini = GeminiAnalyzer.analyze(
                url,
                soup
            )

            claude = ClaudeAnalyzer.analyze(
                url,
                soup
            )

            perplexity = PerplexityAnalyzer.analyze(
                url,
                soup
            )

            return {

                "success": True,

                "basic": {

                    "title": title,

                    "meta_description": description,

                    "language": language,

                    "canonical": canonical,

                    "robots": robots,

                    "h1": h1,

                    "h2": h2

                },

                "llms": llms,

                "chatgpt": chatgpt,

                "gemini": gemini,

                "claude": claude,

                "perplexity": perplexity

            }

        except Exception as e:

            return {

                "success": False,

                "error": str(e)

            }