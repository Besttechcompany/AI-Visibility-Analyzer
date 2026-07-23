import os
import uuid

# Backend folder
BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".."
    )
)

# backend/screenshots
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
    def capture(browser, url: str):

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

        # -----------------------
        # Desktop Screenshot
        # -----------------------

        desktop_context = browser.new_context(
            viewport={
                "width": 1440,
                "height": 900
            }
        )

        desktop_page = desktop_context.new_page()

        desktop_page.goto(
            url,
            wait_until="networkidle",
            timeout=60000
        )

        desktop_path = os.path.join(
            folder,
            "desktop.png"
        )

        desktop_page.screenshot(
            path=desktop_path,
            full_page=True
        )

        desktop_context.close()

        # -----------------------
        # Mobile Screenshot
        # -----------------------

        mobile_context = browser.new_context(
            viewport={
                "width": 390,
                "height": 844
            },
            is_mobile=True,
            has_touch=True
        )

        mobile_page = mobile_context.new_page()

        mobile_page.goto(
            url,
            wait_until="networkidle",
            timeout=60000
        )

        mobile_path = os.path.join(
            folder,
            "mobile.png"
        )

        mobile_page.screenshot(
            path=mobile_path,
            full_page=True
        )

        mobile_context.close()

        return {
            "analysis_id": analysis_id,
            "desktop": f"/screenshots/{analysis_id}/desktop.png",
            "mobile": f"/screenshots/{analysis_id}/mobile.png"
        }