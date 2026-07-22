from playwright.sync_api import sync_playwright
from .models import BrowserEvidence


class Browser:

    @staticmethod
    def collect(url: str) -> BrowserEvidence:

        with sync_playwright() as p:

            browser = None

            try:

                browser = p.chromium.launch(
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                        "--disable-software-rasterizer",
                        "--disable-extensions",
                        "--disable-background-networking",
                        "--disable-background-timer-throttling",
                        "--disable-renderer-backgrounding",
                    ]
                )

                context = browser.new_context()

                page = context.new_page()

                network_requests = []

                page.on(
                    "request",
                    lambda request: network_requests.append(request.url)
                )

                page.goto(
                    url,
                    wait_until="networkidle",
                    timeout=60000
                )

                html = page.content()

                final_url = page.url

                headers = {}

                try:

                    response = page.goto(
                        final_url,
                        wait_until="domcontentloaded",
                        timeout=30000
                    )

                    if response:

                        headers = {
                            k.lower(): v
                            for k, v in response.headers.items()
                        }

                except Exception:
                    pass

                meta = {}

                tags = page.locator("meta").evaluate_all(
                    """
                    els => els.map(e => ({
                        name: e.getAttribute('name'),
                        property: e.getAttribute('property'),
                        content: e.getAttribute('content')
                    }))
                    """
                )

                for tag in tags:

                    key = tag["name"] or tag["property"]

                    if key:

                        meta[key.lower()] = tag["content"] or ""

                scripts = page.locator(
                    "script[src]"
                ).evaluate_all(
                    "els => els.map(e => e.src)"
                )

                stylesheets = page.locator(
                    "link[rel='stylesheet']"
                ).evaluate_all(
                    "els => els.map(e => e.href)"
                )

                cookies = {}

                for cookie in context.cookies():

                    cookies[cookie["name"]] = cookie["value"]

                local_storage = page.evaluate(
                    """
                    () => {
                        const data = {};
                        for (let i = 0; i < localStorage.length; i++) {
                            const k = localStorage.key(i);
                            data[k] = localStorage.getItem(k);
                        }
                        return data;
                    }
                    """
                )

                session_storage = page.evaluate(
                    """
                    () => {
                        const data = {};
                        for (let i = 0; i < sessionStorage.length; i++) {
                            const k = sessionStorage.key(i);
                            data[k] = sessionStorage.getItem(k);
                        }
                        return data;
                    }
                    """
                )

                javascript_globals = page.evaluate(
                    "() => Object.keys(window)"
                )

                return BrowserEvidence(

                    url=url,

                    final_url=final_url,

                    html=html.lower(),

                    headers=headers,

                    meta=meta,

                    scripts=[s.lower() for s in scripts],

                    stylesheets=[s.lower() for s in stylesheets],

                    cookies={
                        k.lower(): v
                        for k, v in cookies.items()
                    },

                    local_storage={
                        k.lower(): v
                        for k, v in local_storage.items()
                    },

                    session_storage={
                        k.lower(): v
                        for k, v in session_storage.items()
                    },

                    javascript_globals=[
                        g.lower()
                        for g in javascript_globals
                    ],

                    network_requests=[
                        r.lower()
                        for r in network_requests
                    ]

                )

            finally:

                if browser:

                    browser.close()