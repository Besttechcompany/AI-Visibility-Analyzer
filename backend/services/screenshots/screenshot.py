import os
import uuid
import time

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".."
    )
)

SCREENSHOTS_DIR = os.path.join(
    BASE_DIR,
    "screenshots"
)

os.makedirs(
    SCREENSHOTS_DIR,
    exist_ok=True
)


class ScreenshotService:

    @staticmethod
    def _prepare_page(page, url: str):

        page.goto(
            url,
            wait_until="networkidle",
            timeout=90000
        )

        page.wait_for_timeout(3000)

        # Scroll page to trigger lazy loading
        page.evaluate("""
        async () => {
            await new Promise(resolve => {

                let totalHeight = 0;
                const distance = 500;

                const timer = setInterval(() => {

                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= document.body.scrollHeight) {

                        clearInterval(timer);
                        window.scrollTo(0, 0);
                        resolve();

                    }

                }, 250);

            });
        }
        """)

        page.wait_for_timeout(1500)

        # Hide common floating widgets
        page.add_style_tag(content="""
        iframe[src*="intercom"],
        iframe[src*="crisp"],
        iframe[src*="tawk"],
        .intercom-lightweight-app,
        .crisp-client,
        .tawk-min-container,
        .fc-widget,
        .whatsapp-widget,
        .whatsapp-chat{
            display:none !important;
        }
        """)

        # Close common cookie popups
        selectors = [
            "#onetrust-accept-btn-handler",
            ".cookie-accept",
            ".cookie-close",
            ".popup-close",
            ".modal-close",
            ".close",
            "button[aria-label='Close']"
        ]

        for selector in selectors:
            try:
                page.locator(selector).click(timeout=1000)
            except Exception:
                pass

        page.wait_for_timeout(1500)

    @staticmethod
    def capture(browser, url: str):

        total_start = time.time()

        analysis_id = str(uuid.uuid4())

        folder = os.path.join(
            SCREENSHOTS_DIR,
            analysis_id
        )

        os.makedirs(
            folder,
            exist_ok=True
        )

        print("=" * 60)
        print("Saving screenshots to:")
        print(folder)
        print("=" * 60)

        # ===========================================
        # Desktop Screenshot
        # ===========================================

        desktop_start = time.time()

        desktop_context = browser.new_context(
            viewport={
                "width": 1440,
                "height": 900
            }
        )

        desktop_page = desktop_context.new_page()

        ScreenshotService._prepare_page(
            desktop_page,
            url
        )

        desktop_path = os.path.join(
            folder,
            "desktop.png"
        )

        desktop_page.screenshot(
            path=desktop_path,
            full_page=True
        )

        print("Desktop exists :", os.path.exists(desktop_path))
        print(f"Desktop Screenshot : {time.time() - desktop_start:.2f} sec")

        desktop_context.close()

        # ===========================================
        # Mobile Screenshot
        # ===========================================

        mobile_start = time.time()

        mobile_context = browser.new_context(
            viewport={
                "width": 390,
                "height": 844
            },
            is_mobile=True,
            has_touch=True
        )

        mobile_page = mobile_context.new_page()

        ScreenshotService._prepare_page(
            mobile_page,
            url
        )

        mobile_path = os.path.join(
            folder,
            "mobile.png"
        )

        mobile_page.screenshot(
            path=mobile_path,
            full_page=True
        )

        print("Mobile exists :", os.path.exists(mobile_path))
        print(f"Mobile Screenshot : {time.time() - mobile_start:.2f} sec")

        mobile_context.close()

        print("=" * 60)
        print("Files in Screenshot Folder:")
        print(os.listdir(folder))
        print("=" * 60)

        print(f"Screenshot Service Total : {time.time() - total_start:.2f} sec")

        return {
            "analysis_id": analysis_id,
            "desktop": f"/screenshots/{analysis_id}/desktop.png",
            "mobile": f"/screenshots/{analysis_id}/mobile.png"
        }