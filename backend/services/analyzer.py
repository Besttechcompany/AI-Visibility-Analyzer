import requests
import socket
import ipaddress
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
    # STRONG WEBSITE URL VALIDATION
    #
    # Only public website HOME PAGES are accepted.
    # This prevents:
    # - Google/search URLs
    # - Render dashboard/event URLs
    # - URLs with query strings/fragments
    # - arbitrary page paths
    # - localhost/private IPs
    # - credential URLs
    # - non-standard ports
    # ==========================================================

    @staticmethod
    def validate_homepage_url(url: str):

        url = str(url or "").strip()

        if not url:
            return False, None, "Website URL is required."

        if not url.lower().startswith(("http://", "https://")):
            url = "https://" + url

        try:
            parsed = urlparse(url)
        except Exception:
            return False, None, "Invalid website address."

        if parsed.scheme.lower() not in ("http", "https"):
            return False, None, "Only HTTP and HTTPS websites are allowed."

        if not parsed.hostname:
            return False, None, "A valid public website domain is required."

        if parsed.username or parsed.password:
            return False, None, "Website URLs containing usernames or passwords are not allowed."

        if parsed.query or parsed.fragment:
            return (
                False,
                None,
                "Please enter the main website homepage only. "
                "Search URLs, query parameters and fragments are not allowed."
            )

        # Website homepage only.
        if parsed.path not in ("", "/"):
            return (
                False,
                None,
                "Please enter the main website homepage only. "
                "Individual page URLs are not accepted."
            )

        if parsed.port not in (None, 80, 443):
            return (
                False,
                None,
                "Only standard HTTP/HTTPS ports are allowed."
            )

        hostname = parsed.hostname.lower().rstrip(".")

        if hostname.startswith("www."):
            domain_for_validation = hostname[4:]
        else:
            domain_for_validation = hostname

        if (
            hostname == "localhost"
            or hostname.endswith(".localhost")
            or hostname.endswith(".local")
            or hostname.endswith(".internal")
            or hostname == "127.0.0.1"
            or hostname == "::1"
        ):
            return False, None, "Local or private websites cannot be analyzed."

        # Reject literal IP addresses.
        try:
            ip = ipaddress.ip_address(hostname)
            return False, None, "Please enter a public website domain, not an IP address."
        except ValueError:
            pass

        # Basic domain validation.
        if (
            "." not in domain_for_validation
            or domain_for_validation.startswith(".")
            or domain_for_validation.endswith(".")
            or ".." in domain_for_validation
        ):
            return False, None, "Please enter a valid public website domain."

        labels = domain_for_validation.split(".")

        if any(
            not label
            or len(label) > 63
            or label.startswith("-")
            or label.endswith("-")
            or not re.fullmatch(r"[a-z0-9-]+", label)
            for label in labels
        ):
            return False, None, "Please enter a valid public website domain."

        if len(domain_for_validation) > 253:
            return False, None, "The website domain is too long."

        # DNS validation also blocks common SSRF/private-network targets.
        try:
            addresses = {
                result[4][0]
                for result in socket.getaddrinfo(
                    hostname,
                    parsed.port or (443 if parsed.scheme.lower() == "https" else 80),
                    type=socket.SOCK_STREAM
                )
            }

            if not addresses:
                return False, None, "The website domain could not be resolved."

            for address in addresses:
                try:
                    ip = ipaddress.ip_address(address)
                    if (
                        ip.is_private
                        or ip.is_loopback
                        or ip.is_link_local
                        or ip.is_reserved
                        or ip.is_multicast
                        or ip.is_unspecified
                    ):
                        return (
                            False,
                            None,
                            "This domain does not resolve to a public website."
                        )
                except ValueError:
                    continue

        except socket.gaierror:
            return False, None, "The website domain could not be resolved."

        normalized = (
            parsed.scheme.lower()
            + "://"
            + parsed.hostname
            + "/"
        )

        return True, normalized, ""


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
    # MAIN WEBSITE ANALYSIS
    # ==========================================================

    @staticmethod
    def analyze(
        url: str
    ):

        response = None


        # ======================================================
        # STRONG URL VALIDATION
        # ======================================================

        is_valid, normalized_url, validation_error = (
            WebsiteAnalyzer.validate_homepage_url(url)
        )

        if not is_valid:

            return {
                "success": False,
                "website_status": "invalid",
                "analysis_mode": "not_analyzed",
                "live_website": False,
                "url": str(url or "").strip(),
                "website": str(url or "").strip(),
                "website_url": str(url or "").strip(),
                "error": validation_error
            }

        url = normalized_url

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
        # FINAL URL / REDIRECT VALIDATION
        # ======================================================
        #
        # A website must not redirect the analyzer to a different
        # domain or to a search/dashboard URL.
        #

        final_url = str(response.url or "").strip()

        try:
            final_parsed = urlparse(final_url)

            original_host = (
                urlparse(url).hostname or ""
            ).lower().removeprefix("www.")

            final_host = (
                final_parsed.hostname or ""
            ).lower().removeprefix("www.")

            final_is_homepage = (
                final_parsed.path in ("", "/")
                and not final_parsed.query
                and not final_parsed.fragment
            )

            if (
                final_parsed.scheme.lower()
                not in ("http", "https")
                or not final_host
                or final_host != original_host
                or not final_is_homepage
            ):

                return {
                    "success": False,
                    "website_status": "inactive",
                    "analysis_mode": "not_analyzed",
                    "live_website": False,
                    "url": url,
                    "website": url,
                    "website_url": url,
                    "final_url": final_url,
                    "http_status": response.status_code,
                    "error": (
                        "The website redirected to an invalid or "
                        "different destination. No report was generated."
                    )
                }

        except Exception as exc:

            return {
                "success": False,
                "website_status": "inactive",
                "analysis_mode": "not_analyzed",
                "live_website": False,
                "url": url,
                "website": url,
                "website_url": url,
                "final_url": final_url,
                "http_status": response.status_code,
                "error": (
                    "The final website destination could not be verified."
                )
            }

        # ======================================================
        # HTTP STATUS CHECK
        # ======================================================

        if response.status_code >= 400:

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

                "http_status":
                    response.status_code,

                "error": (
                    "The website returned HTTP "
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