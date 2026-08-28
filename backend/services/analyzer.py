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

    # ==========================================================
    # USER AGENT
    # ==========================================================

    HEADERS = {

        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/137.0.0.0 Safari/537.36"
        ),

        "Accept": (
            "text/html,"
            "application/xhtml+xml,"
            "application/xml;q=0.9,"
            "image/avif,"
            "image/webp,"
            "image/apng,"
            "*/*;q=0.8"
        ),

        "Accept-Language":
            "en-US,en;q=0.9"

    }


    # ==========================================================
    # PARKED / INACTIVE WEBSITE DETECTION
    # ==========================================================

    @staticmethod
    def is_inactive_or_parked_website(
        response
    ):

        try:

            html = (
                response.text or ""
            ).lower()


            final_url = (
                str(response.url or "")
                .lower()
            )


            # ==================================================
            # DOMAIN PARKING SIGNALS
            # ==================================================

            parking_signals = [

                "this domain is registered",

                "domain is registered",

                "this domain may still be available",

                "domain may still be available",

                "get this domain",

                "buy this domain",

                "buy this domain name",

                "domain for sale",

                "this domain is for sale",

                "domain parking",

                "parked domain",

                "this domain has been parked",

                "domain name is for sale",

                "purchase this domain",

                "inquire about this domain",

                "make an offer for this domain",

                "domain available for purchase",

                "this domain is available"

            ]


            # ==================================================
            # PARKING PROVIDERS
            # ==================================================

            parking_providers = [

                "godaddy.com",

                "sedo.com",

                "hugedomains.com",

                "afternic.com",

                "dan.com",

                "parkingcrew.com",

                "bodis.com",

                "undeveloped.com",

                "sav.com"

            ]


            parking_matches = 0


            for signal in parking_signals:

                if signal in html:

                    parking_matches += 1


            provider_match = False


            for provider in parking_providers:

                if provider in html:

                    provider_match = True

                    break


                if provider in final_url:

                    provider_match = True

                    break


            # ==================================================
            # STRONG PARKED DOMAIN DETECTION
            # ==================================================

            if parking_matches >= 2:

                return True


            if (
                parking_matches >= 1
                and provider_match
            ):

                return True


            # ==================================================
            # GODADDY PARKING PAGE
            # ==================================================

            if (
                "godaddy" in html
                and (
                    "get this domain" in html
                    or
                    "domain is registered" in html
                    or
                    "may still be available" in html
                )
            ):

                return True


            # ==================================================
            # PLACEHOLDER WEBSITE SIGNALS
            # ==================================================

            placeholder_signals = [

                "coming soon",

                "website coming soon",

                "site coming soon",

                "under construction",

                "site under construction",

                "website under construction",

                "default web page",

                "default nginx page",

                "welcome to nginx",

                "welcome to apache",

                "apache2 ubuntu default page",

                "test page",

                "sample page"

            ]


            for signal in placeholder_signals:

                if signal in html:

                    return True


            return False


        except Exception as exc:

            print(
                "Inactive website detection warning:",
                str(exc)
            )

            return False


    # ==========================================================
    # SAFE ANALYZER
    # ==========================================================

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

            # ==========================================================
    # BROWSER FALLBACK
    # ==========================================================

    @staticmethod
    def fetch_with_browser(url: str):
        """
        Fetch a website with Chromium when direct requests are blocked
        (for example HTTP 403/429).

        Returns a requests.Response-compatible object so all existing
        analyzers can continue using response.text, response.url,
        response.status_code and response.headers.
        """

        browser_manager = None
        page = None

        try:
            print("==================================================")
            print("BROWSER FALLBACK STARTED")
            print("URL:", url)
            print("==================================================")

            browser_manager = BrowserManager()
            browser = browser_manager.start()

            page = browser.new_page(
                viewport={
                    "width": 1366,
                    "height": 768
                },
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/137.0.0.0 Safari/537.36"
                ),
                extra_http_headers={
                    "Accept": (
                        "text/html,application/xhtml+xml,"
                        "application/xml;q=0.9,image/avif,"
                        "image/webp,*/*;q=0.8"
                    ),
                    "Accept-Language": "en-US,en;q=0.9"
                }
            )

            browser_response = None

            try:
                browser_response = page.goto(
                    url,
                    wait_until="domcontentloaded",
                    timeout=30000
                )
            except Exception as exc:
                print(
                    "Browser navigation warning:",
                    repr(exc)
                )

            # Allow JavaScript, redirects and security checks to finish.
            try:
                page.wait_for_load_state(
                    "networkidle",
                    timeout=10000
                )
            except Exception:
                pass

            html = page.content()
            final_url = page.url

            status_code = 200

            if browser_response:
                try:
                    status_code = browser_response.status
                except Exception:
                    status_code = 200

            # Build a requests.Response-compatible object.
            browser_result = requests.Response()

            browser_result.status_code = status_code
            browser_result.url = final_url
            browser_result._content = (
                html or ""
            ).encode("utf-8", errors="ignore")
            browser_result.encoding = "utf-8"

            # Ensure the existing content-type check accepts browser HTML.
            browser_result.headers["content-type"] = "text/html; charset=utf-8"

            if browser_response:
                try:
                    browser_headers = browser_response.all_headers()

                    if browser_headers:
                        for key, value in browser_headers.items():
                            browser_result.headers[key] = value
                except Exception as exc:
                    print(
                        "Browser headers warning:",
                        repr(exc)
                    )

            print("BROWSER FALLBACK SUCCESS")
            print("Final URL:", final_url)
            print("Browser HTTP Status:", status_code)
            print("HTML Length:", len(html or ""))

            return browser_result

        except Exception as exc:

            print(
                "BROWSER FALLBACK ERROR:",
                repr(exc)
            )

            return None

        finally:

            if page:
                try:
                    page.close()
                except Exception as exc:
                    print(
                        "Browser page cleanup warning:",
                        repr(exc)
                    )

            if browser_manager:
                try:
                    browser_manager.stop()
                except Exception as exc:
                    print(
                        "Browser cleanup warning:",
                        repr(exc)
                    )


    # ==========================================================
    # MAIN WEBSITE ANALYSIS
    # ==========================================================

    @staticmethod
    def analyze(
        url: str
    ):

        response = None


        # ======================================================
        # NORMALIZE URL
        # ======================================================

        url = (
            str(url)
            .strip()
        )


        if not url:

            return {

                "success": False,

                "website_status":
                    "invalid",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "error":
                    "Website URL is required."

            }


        if not url.lower().startswith(
            ("http://", "https://")
        ):

            url = (
                "https://"
                + url
            )


        # ======================================================
        # PARSED URL
        # ======================================================

        try:

            parsed_url = urlparse(
                url
            )

            if not parsed_url.hostname:

                return {

                    "success": False,

                    "website_status":
                        "invalid",

                    "analysis_mode":
                        "not_analyzed",

                    "live_website":
                        False,

                    "url":
                        url,

                    "error":
                        "Invalid website address."

                }

        except Exception as exc:

            return {

                "success": False,

                "website_status":
                    "invalid",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "url":
                    url,

                "error":
                    str(exc)

            }


        # ======================================================
        # REQUEST LIVE WEBSITE
        # ======================================================

        try:

            response = requests.get(

                url,

                headers=
                    WebsiteAnalyzer.HEADERS,

                timeout=20,

                allow_redirects=True

            )


        except requests.exceptions.SSLError as exc:

            print(
                "SSL error:",
                str(exc)
            )


            return {

                "success": False,

                "website_status":
                    "inactive",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "url":
                    url,

                "website":
                    url,

                "website_url":
                    url,

                "error": (
                    "The website could not be reached "
                    "because of an SSL/security error."
                )

            }


        except requests.exceptions.ConnectionError as exc:

            print(
                "Connection error:",
                str(exc)
            )


            return {

                "success": False,

                "website_status":
                    "inactive",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "url":
                    url,

                "website":
                    url,

                "website_url":
                    url,

                "error": (
                    "This website is currently unavailable "
                    "or could not be reached."
                )

            }


        except requests.exceptions.Timeout as exc:

            print(
                "Timeout:",
                str(exc)
            )


            return {

                "success": False,

                "website_status":
                    "inactive",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "url":
                    url,

                "website":
                    url,

                "website_url":
                    url,

                "error": (
                    "The website took too long to respond. "
                    "Please make sure the website is active."
                )

            }


        except requests.exceptions.RequestException as exc:

            print(
                "Request error:",
                str(exc)
            )


            return {

                "success": False,

                "website_status":
                    "inactive",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "url":
                    url,

                "website":
                    url,

                "website_url":
                    url,

                "error": (
                    "The website could not be reached."
                )

            }


        # ======================================================
        # HTTP STATUS / BROWSER FALLBACK
        # ======================================================

        browser_fallback_used = False

        # A 403/429 does NOT automatically mean the website is inactive.
        # Many websites block Python requests while allowing a real browser.
        if response.status_code in (403, 429):

            print(
                "Direct HTTP request returned:",
                response.status_code
            )

            print(
                "Trying Chromium browser fallback..."
            )

            browser_response = (
                WebsiteAnalyzer.fetch_with_browser(url)
            )

            if browser_response is not None:

                browser_html = (
                    browser_response.text or ""
                ).strip()

                # Continue with browser HTML when it contains a usable page.
                if len(browser_html) >= 200:

                    response = browser_response
                    browser_fallback_used = True

                    print(
                        "Using browser HTML for analysis."
                    )

                else:

                    print(
                        "Browser returned insufficient HTML."
                    )

        # Other 4xx/5xx errors are still treated as failures.
        # 403/429 were already given a browser fallback above.
        if response.status_code >= 400 and not browser_fallback_used:

            return {

                "success": False,

                "website_status":
                    "blocked" if response.status_code in (403, 429)
                    else "error",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "url":
                    url,

                "website":
                    url,

                "website_url":
                    url,

                "final_url":
                    str(response.url),

                "http_status":
                    response.status_code,

                "error": (
                    "The website could not be analyzed because "
                    "the server returned HTTP "
                    + str(
                        response.status_code
                    )
                    + "."
                )

            }


        # ======================================================
        # CONTENT TYPE CHECK
        # ======================================================

        content_type = (
            response.headers.get(
                "content-type",
                ""
            )
            .lower()
        )


        if (
            "text/html" not in content_type
            and
            "application/xhtml+xml"
            not in content_type
        ):

            # Browser fallback already gives us HTML. Do not reject it
            # only because the origin response headers were unusual.
            if not browser_fallback_used:

                return {

                    "success": False,

                    "website_status":
                        "inactive",

                    "analysis_mode":
                        "not_analyzed",

                    "live_website":
                        False,

                    "url":
                        url,

                    "website":
                        url,

                    "website_url":
                        url,

                    "error": (
                        "The URL does not return a normal "
                        "HTML website."
                    )

                }


        # ======================================================
        # PARKED / PLACEHOLDER CHECK
        # ======================================================

        if WebsiteAnalyzer.is_inactive_or_parked_website(
            response
        ):

            print(
                "Parked/inactive website detected:",
                url
            )


            return {

                "success": False,

                "website_status":
                    "inactive",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "url":
                    url,

                "website":
                    url,

                "website_url":
                    url,

                "final_url":
                    str(
                        response.url
                    ),

                "error": (
                    "This domain is registered or parked, "
                    "but it does not currently have an "
                    "active website."
                )

            }


        # ======================================================
        # PARSE REAL WEBSITE
        # ======================================================

        try:

            soup = BeautifulSoup(

                response.text,

                "lxml"

            )

        except Exception as exc:

            print(
                "HTML parsing error:",
                str(exc)
            )


            return {

                "success": False,

                "website_status":
                    "inactive",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "url":
                    url,

                "error":
                    "The website HTML could not be read."

            }


        # ======================================================
        # BASIC WEBSITE CONTENT CHECK
        # ======================================================

        body_text = (
            soup.get_text(
                " ",
                strip=True
            )
        )


        title_tag = soup.find(
            "title"
        )


        h1_tags = soup.find_all(
            "h1"
        )


        # ======================================================
        # EMPTY / NON-WEBSITE PAGE
        # ======================================================

        if (
            not title_tag
            and
            not h1_tags
            and
            len(body_text) < 50
        ):

            return {

                "success": False,

                "website_status":
                    "inactive",

                "analysis_mode":
                    "not_analyzed",

                "live_website":
                    False,

                "url":
                    url,

                "website":
                    url,

                "website_url":
                    url,

                "error": (
                    "The domain is reachable, but it does "
                    "not appear to contain an active website."
                )

            }

                # ======================================================
        # BASIC INFORMATION
        # ======================================================

        title = ""


        if (
            soup.title
            and soup.title.string
        ):

            title = (
                soup.title.string
                .strip()
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

            for h in
            soup.find_all("h1")

        ]


        h2 = [

            h.get_text(
                strip=True
            )

            for h in
            soup.find_all("h2")

        ]


        # ======================================================
        # LLM ANALYSIS
        # ======================================================

        llms = WebsiteAnalyzer.safe_analyze(

            lambda:
                LLMAnalyzer.analyze(
                    url
                ),

            default={}

        )


        # ======================================================
        # CHATGPT
        # ======================================================

        chatgpt = WebsiteAnalyzer.safe_analyze(

            lambda:
                ChatGPTAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        # ======================================================
        # GEMINI
        # ======================================================

        gemini = WebsiteAnalyzer.safe_analyze(

            lambda:
                GeminiAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        # ======================================================
        # CLAUDE
        # ======================================================

        claude = WebsiteAnalyzer.safe_analyze(

            lambda:
                ClaudeAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        # ======================================================
        # PERPLEXITY
        # ======================================================

        perplexity = WebsiteAnalyzer.safe_analyze(

            lambda:
                PerplexityAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        # ======================================================
        # GROK
        # ======================================================

        grok = WebsiteAnalyzer.safe_analyze(

            lambda:
                GrokAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        # ======================================================
        # GOOGLE AI MODE
        # ======================================================

        google_ai_mode = WebsiteAnalyzer.safe_analyze(

            lambda:
                GoogleAIModeAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        # ======================================================
        # DEEPSEEK
        # ======================================================

        deepseek = WebsiteAnalyzer.safe_analyze(

            lambda:
                DeepSeekAnalyzer.analyze(
                    url,
                    soup
                ),

            default={}

        )


        # ======================================================
        # ENTITIES
        # ======================================================

        entities = WebsiteAnalyzer.safe_analyze(

            lambda:
                EntityAnalyzer.analyze(
                    soup
                ),

            default={}

        )


        # ======================================================
        # E-E-A-T
        # ======================================================

        eeat = WebsiteAnalyzer.safe_analyze(

            lambda:
                EEATAnalyzer.analyze(
                    soup
                ),

            default={}

        )


        # ======================================================
        # AUDIT
        # ======================================================

        audit = WebsiteAnalyzer.safe_analyze(

            lambda:
                AuditAnalyzer.analyze(
                    soup,
                    response.text
                ),

            default={}

        )


        # ======================================================
        # TECHNICAL SEO
        # ======================================================

        technical = WebsiteAnalyzer.safe_analyze(

            lambda:
                TechnicalSEOAnalyzer.analyze(
                    url,
                    response,
                    soup
                ),

            default={}

        )


        # ======================================================
        # TECHNOLOGY DETECTION
        #
        # ONLY runs after website has passed the
        # active/parked/placeholder checks.
        # ======================================================

        technology = []


        browser_manager = None


        try:

            browser_manager =BrowserManager()
                


            browser = browser_manager.start()
               


            technology = (
                WebsiteAnalyzer.safe_analyze(

                    lambda:
                        TechnologyAnalyzer.analyze(
                            browser,
                            response,
                            soup
                        ),

                    default=[]

                )
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

                except Exception as exc:

                    print(
                        "Browser cleanup warning:",
                        str(exc)
                    )

                            # ======================================================
        # BUILD FINAL RESULT
        # ======================================================

        result = {

            "success":
                True,


            # ==================================================
            # WEBSITE STATUS
            # ==================================================

            "website_status":
                "active",


            "analysis_mode":
                "live",


            "live_website":
                True,


            "url":
                url,


            "website":
                url,


            "website_url":
                url,


            "final_url":
                str(
                    response.url
                ),


            "http_status":
                response.status_code,


            "analysis_notice":
                (
                    "Live website analysis completed successfully "
                    "using browser fallback."
                    if browser_fallback_used
                    else
                    "Live website analysis completed successfully."
                ),


            # ==================================================
            # BASIC INFORMATION
            # ==================================================

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


            # ==================================================
            # LLM
            # ==================================================

            "llms":
                llms,


            # ==================================================
            # AI PLATFORMS
            # ==================================================

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


            # ==================================================
            # OTHER ANALYSIS
            # ==================================================

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


        # ======================================================
        # RECOMMENDATIONS
        # ======================================================

        result["recommendations"] = (

            WebsiteAnalyzer.safe_analyze(

                lambda:
                    RecommendationAnalyzer.analyze(
                        result
                    ),

                default=[]

            )

        )


        # ======================================================
        # OVERALL AI VISIBILITY SCORE
        # ======================================================

        result[
            "overall_ai_visibility"
        ] = (

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


        # ======================================================
        # LOGGING
        # ======================================================

        print(
            "=================================================="
        )

        print(
            "Website Analysis Completed"
        )

        print(
            "URL:",
            url
        )

        print(
            "Final URL:",
            response.url
        )

        print(
            "HTTP Status:",
            response.status_code
        )

        print(
            "Website Status:",
            "ACTIVE"
        )

        print(
            "Analysis Mode:",
            "LIVE"
        )

        print(
            "=================================================="
        )


        # ======================================================
        # RETURN RESULT
        # ======================================================

        return result