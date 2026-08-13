import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

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

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/137.0 Safari/537.36"
        )
    }


    # ======================================================
    # CREATE FALLBACK HTML
    # ======================================================

    @staticmethod
    def create_fallback_html(url: str) -> str:

        parsed = urlparse(url)

        domain = (
            parsed.netloc
            or parsed.path
            or url
        )

        return f"""
        <!DOCTYPE html>

        <html lang="en">

        <head>

            <meta charset="UTF-8">

            <title>{domain}</title>

            <meta
                name="description"
                content="AI visibility analysis for {domain}"
            >

            <meta
                name="robots"
                content="index, follow"
            >

            <link
                rel="canonical"
                href="{url}"
            >

        </head>

        <body>

            <main>

                <h1>
                    {domain}
                </h1>

                <h2>
                    AI Visibility Analysis
                </h2>

                <p>
                    This website could not be reached directly
                    during the analysis.
                </p>

            </main>

        </body>

        </html>
        """


    # ======================================================
    # SAFE ANALYZER
    #
    # One failed analyzer should not stop the report.
    # ======================================================

    @staticmethod
    def safe_analyze(
        analyzer_function,
        default=None
    ):

        try:

            return analyzer_function()

        except Exception as exc:

            print(
                "Analyzer warning:",
                str(exc)
            )

            if default is not None:

                return default

            return {}


            # ======================================================
    # MAIN ANALYSIS
    # ======================================================

    @staticmethod
    def analyze(url: str):

        response = None

        live_website = True

        website_status = "active"

        analysis_mode = "live"

        fetch_error = ""


        # ==================================================
        # TRY TO FETCH LIVE WEBSITE
        # ==================================================

        try:

            response = requests.get(

                url,

                headers=
                    WebsiteAnalyzer.HEADERS,

                timeout=20,

                allow_redirects=True

            )

            response.raise_for_status()


        except Exception as exc:

            # ==============================================
            # WEBSITE NOT AVAILABLE
            #
            # DO NOT STOP THE REPORT
            # ==============================================

            live_website = False

            website_status = "unreachable"

            analysis_mode = "estimated"

            fetch_error = str(exc)


            print(
                "Website could not be reached:",
                fetch_error
            )


            # ==============================================
            # CREATE FALLBACK HTML
            # ==============================================

            fallback_html = (
                WebsiteAnalyzer.create_fallback_html(
                    url
                )
            )


            # ==============================================
            # CREATE SAFE RESPONSE OBJECT
            # ==============================================

            response = requests.Response()

            response.status_code = 200

            response.url = url

            response._content = (
                fallback_html.encode(
                    "utf-8"
                )
            )

            response.headers[
                "content-type"
            ] = "text/html; charset=utf-8"


        # ==================================================
        # PARSE HTML
        # ==================================================

        try:

            soup = BeautifulSoup(
                response.text,
                "lxml"
            )

        except Exception:

            soup = BeautifulSoup(
                "<html></html>",
                "lxml"
            )


        # ==================================================
        # BASIC INFORMATION
        # ==================================================

        title = ""


        if (
            soup.title
            and soup.title.string
        ):

            title = (
                soup.title.string.strip()
            )


        description = ""


        meta = soup.find(
            "meta",
            attrs={
                "name":
                    "description"
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
                "name":
                    "robots"
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

                # ==================================================
        # LLM ANALYSIS
        # ==================================================

        llms = WebsiteAnalyzer.safe_analyze(

            lambda:
                LLMAnalyzer.analyze(
                    url
                ),

            default={}

        )


        # ==================================================
        # AI PLATFORM ANALYSIS
        # ==================================================

        chatgpt = WebsiteAnalyzer.safe_analyze(

            lambda:
                ChatGPTAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        gemini = WebsiteAnalyzer.safe_analyze(

            lambda:
                GeminiAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        claude = WebsiteAnalyzer.safe_analyze(

            lambda:
                ClaudeAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        perplexity = WebsiteAnalyzer.safe_analyze(

            lambda:
                PerplexityAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        grok = WebsiteAnalyzer.safe_analyze(

            lambda:
                GrokAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        google_ai_mode = WebsiteAnalyzer.safe_analyze(

            lambda:
                GoogleAIModeAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        deepseek = WebsiteAnalyzer.safe_analyze(

            lambda:
                DeepSeekAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        # ==================================================
        # ENTITIES
        # ==================================================

        entities = WebsiteAnalyzer.safe_analyze(

            lambda:
                EntityAnalyzer.analyze(
                    soup
                ),

            default={}

        )


        # ==================================================
        # E-E-A-T
        # ==================================================

        eeat = WebsiteAnalyzer.safe_analyze(

            lambda:
                EEATAnalyzer.analyze(
                    soup
                ),

            default={}

        )


        # ==================================================
        # AUDIT
        # ==================================================

        audit = WebsiteAnalyzer.safe_analyze(

            lambda:
                AuditAnalyzer.analyze(
                    soup,
                    response.text
                ),

            default={}

        )


        # ==================================================
        # TECHNICAL SEO
        # ==================================================

        technical = WebsiteAnalyzer.safe_analyze(

            lambda:
                TechnicalSEOAnalyzer.analyze(
                    url,
                    response,
                    soup
                ),

            default={}

        )


        # ==================================================
        # TECHNOLOGY DETECTION
        #
        # Only detect technologies when the actual website
        # was successfully fetched.
        # ==================================================

        technology = []


        if live_website:

            browser_manager = None


            try:

                browser_manager =BrowserManager()
                    


                browser =browser_manager.start()
                    


                technology =WebsiteAnalyzer.safe_analyze(
                    

                        lambda:
                            TechnologyAnalyzer.analyze(
                                browser,
                                response,
                                soup
                            ),

                        default=[]

                    )


            except Exception as exc:

                print(
                    "Technology detection warning:",
                    str(exc)
                )

                technology = []


            finally:

                if browser_manager:

                    try:

                        browser_manager.stop()

                    except Exception:

                        pass

                            # ==================================================
        # BUILD RESULT
        # ==================================================

        result = {

            "success":
                True,


            # ==============================================
            # WEBSITE STATUS
            # ==============================================

            "website_status":
                website_status,


            "analysis_mode":
                analysis_mode,


            "live_website":
                live_website,


            "url":
                url,


            "website":
                url,


            "website_url":
                url,


            # ==============================================
            # FRONTEND NOTICE
            # ==============================================

            "analysis_notice": (

                "Live website analysis completed successfully."

                if live_website

                else (

                    "This website could not be reached directly. "
                    "The report is an estimated AI visibility "
                    "analysis and is not a live website audit."

                )

            ),


            # ==============================================
            # FETCH ERROR
            # ==============================================

            "fetch_error": (

                fetch_error

                if not live_website

                else ""

            ),


            # ==============================================
            # BASIC
            # ==============================================

            "basic": {

                "title":
                    title,

                "meta_description":
                    description,

                "language":
                    language,

                "canonical":
                    canonical,

                "robots":
                    robots,

                "h1":
                    h1,

                "h2":
                    h2

            },


            # ==============================================
            # LLMs
            # ==============================================

            "llms":
                llms,


            # ==============================================
            # AI PLATFORMS
            # ==============================================

            "chatgpt":
                chatgpt,

            "gemini":
                gemini,

            "claude":
                claude,

            "perplexity":
                perplexity,

            "grok":
                grok,

            "google_ai_mode":
                google_ai_mode,

            "deepseek":
                deepseek,


            # ==============================================
            # OTHER ANALYSIS
            # ==============================================

            "entities":
                entities,

            "eeat":
                eeat,

            "audit":
                audit,

            "technical_seo":
                technical,

            "technology":
                technology

        }


        # ==================================================
        # AI RECOMMENDATIONS
        # ==================================================

        result["recommendations"] = (

            WebsiteAnalyzer.safe_analyze(

                lambda:
                    RecommendationAnalyzer.analyze(
                        result
                    ),

                default=[]

            )

        )


        # ==================================================
        # OVERALL AI VISIBILITY SCORE
        # ==================================================

        result["overall_ai_visibility"] = (

            WebsiteAnalyzer.safe_analyze(

                lambda:
                    ScoreAnalyzer.analyze(
                        result
                    ),

                default={
                    "score": 0
                }

            )

        )


        # ==================================================
        # RETURN RESULT
        # ==================================================

        return result