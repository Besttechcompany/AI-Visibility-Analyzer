import requests
from bs4 import BeautifulSoup

from services.llms import LLMAnalyzer
from services.chatgpt import ChatGPTAnalyzer
from services.gemini import GeminiAnalyzer
from services.claude import ClaudeAnalyzer
from services.perplexity import PerplexityAnalyzer

from services.entities import EntityAnalyzer
from services.recommendations import RecommendationAnalyzer
from services.score import ScoreAnalyzer
from services.eeat import EEATAnalyzer
from services.audit import AuditAnalyzer
from services.technical_seo import TechnicalSEOAnalyzer
from services.technology.technology import TechnologyAnalyzer
from services.browser.browser import BrowserManager

from services.grok import GrokAnalyzer
from services.google_ai_mode import GoogleAIModeAnalyzer
from services.deepseek import DeepSeekAnalyzer


class WebsiteAnalyzer:

    @staticmethod
    def analyze(url: str):

        try:

            # =====================================================
            # HTTP REQUEST
            # =====================================================

            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 "
                    "(KHTML, like Gecko) "
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

            # =====================================================
            # PARSE WEBSITE
            # =====================================================

            soup = BeautifulSoup(
                response.text,
                "lxml"
            )

            # =====================================================
            # BASIC INFORMATION
            # =====================================================

            title = (
                soup.title.string.strip()
                if soup.title and soup.title.string
                else ""
            )

            description = ""

            meta = soup.find(
                "meta",
                attrs={
                    "name": "description"
                }
            )

            if meta:

                description = meta.get(
                    "content",
                    ""
                )

            language = ""

            if soup.html:

                language = soup.html.get(
                    "lang",
                    ""
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
                attrs={
                    "name": "robots"
                }
            )

            if robots_tag:

                robots = robots_tag.get(
                    "content",
                    ""
                )

            h1 = [

                h.get_text(
                    strip=True
                )

                for h in soup.find_all("h1")

            ]

            h2 = [

                h.get_text(
                    strip=True
                )

                for h in soup.find_all("h2")

            ]

            # =====================================================
            # AI ANALYZERS
            # =====================================================

            llms = LLMAnalyzer.analyze(
                url
            )

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

            # =====================================================
            # NEW AI PLATFORMS
            # =====================================================

            grok = GrokAnalyzer.analyze(
                url,
                soup
            )

            google_ai_mode = GoogleAIModeAnalyzer.analyze(
                url,
                soup
            )

            deepseek = DeepSeekAnalyzer.analyze(
                url,
                soup
            )

            # =====================================================
            # OTHER ANALYZERS
            # =====================================================

            entities = EntityAnalyzer.analyze(
                soup
            )

            eeat = EEATAnalyzer.analyze(
                soup
            )

            audit = AuditAnalyzer.analyze(
                soup,
                response.text
            )

            technical = TechnicalSEOAnalyzer.analyze(
                url,
                response,
                soup
            )

            # =====================================================
            # TECHNOLOGY DETECTION
            # =====================================================

            browser_manager = BrowserManager()

            browser = browser_manager.start()

            try:

                technology = TechnologyAnalyzer.analyze(
                    browser,
                    response,
                    soup
                )

            finally:

                browser_manager.stop()

            # =====================================================
            # BUILD RESULT
            # =====================================================

            result = {

                "success": True,

                # -------------------------------------------------
                # BASIC
                # -------------------------------------------------

                "basic": {

                    "title": title,

                    "meta_description": description,

                    "language": language,

                    "canonical": canonical,

                    "robots": robots,

                    "h1": h1,

                    "h2": h2

                },

                # -------------------------------------------------
                # LLMs
                # -------------------------------------------------

                "llms": llms,

                # -------------------------------------------------
                # AI PLATFORMS
                # -------------------------------------------------

                "chatgpt": chatgpt,

                "gemini": gemini,

                "claude": claude,

                "perplexity": perplexity,

                "grok": grok,

                "google_ai_mode": google_ai_mode,

                "deepseek": deepseek,

                # -------------------------------------------------
                # OTHER ANALYSIS
                # -------------------------------------------------

                "entities": entities,

                "eeat": eeat,

                "audit": audit,

                "technical_seo": technical,

                "technology": technology

            }

            # =====================================================
            # AI RECOMMENDATIONS
            # =====================================================

            result["recommendations"] = (

                RecommendationAnalyzer.analyze(
                    result
                )

            )

            # =====================================================
            # OVERALL AI VISIBILITY SCORE
            # =====================================================

            result["overall_ai_visibility"] = (

                ScoreAnalyzer.analyze(
                    result
                )

            )

            return result

        # =========================================================
        # ERROR HANDLING
        # =========================================================

        except Exception as e:

            return {

                "success": False,

                "error": str(e)

            }