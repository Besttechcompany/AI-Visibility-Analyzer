import os
from playwright.sync_api import sync_playwright

os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "0"


class BrowserManager:

    def __init__(self):
        self.playwright = None
        self.browser = None

    def start(self):
        self.playwright = sync_playwright().start()

        self.browser = self.playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-software-rasterizer",
            ]
        )

        return self.browser

    def fetch_page(self, url, timeout=30000):
        """
        Open a website using a real Chromium browser and
        return a requests-compatible response object.
        """

        if not self.browser:
            self.start()

        page = None

        try:
            page = self.browser.new_page(
                viewport={
                    "width": 1366,
                    "height": 768
                },
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/137.0.0.0 Safari/537.36"
                )
            )

            response = page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=timeout
            )

            # Give JavaScript-driven websites some time to finish.
            try:
                page.wait_for_load_state(
                    "networkidle",
                    timeout=10000
                )
            except Exception:
                pass

            html = page.content()
            final_url = page.url

            status_code = (
                response.status
                if response
                else 200
            )

            # Create a requests-compatible Response.
            import requests

            result = requests.Response()

            result.status_code = status_code
            result.url = final_url
            result._content = html.encode("utf-8")
            result.encoding = "utf-8"

            # Copy browser response headers when available.
            if response:
                result.headers.update(
                    response.all_headers()
                )

            return result

        finally:

            if page:
                try:
                    page.close()
                except Exception:
                    pass

    def stop(self):
        if self.browser:
            self.browser.close()
            self.browser = None

        if self.playwright:
            self.playwright.stop()
            self.playwright = None