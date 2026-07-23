from .browser import Browser
from .models import BrowserEvidence


class EvidenceCollector:
    """
    Collects browser-rendered evidence using Playwright.
    """

    @staticmethod
    def collect(browser, url: str) -> BrowserEvidence:

        print("=" * 60)
        print("Collecting Browser Evidence")
        print("=" * 60)

        evidence = Browser.collect(browser, url)

        print(f"Original URL       : {evidence.url}")
        print(f"Final URL          : {evidence.final_url}")
        print(f"HTML Length        : {len(evidence.html)}")
        print(f"Headers            : {len(evidence.headers)}")
        print(f"Meta Tags          : {len(evidence.meta)}")
        print(f"Scripts            : {len(evidence.scripts)}")
        print(f"Stylesheets        : {len(evidence.stylesheets)}")
        print(f"Cookies            : {len(evidence.cookies)}")
        print(f"Local Storage      : {len(evidence.local_storage)}")
        print(f"Session Storage    : {len(evidence.session_storage)}")
        print(f"JS Globals         : {len(evidence.javascript_globals)}")
        print(f"Network Requests   : {len(evidence.network_requests)}")

        return evidence