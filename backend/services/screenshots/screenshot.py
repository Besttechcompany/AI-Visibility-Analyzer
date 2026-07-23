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

        desktop_page.goto(
            url,
            wait_until="domcontentloaded",
            timeout=30000
        )

        desktop_page.wait_for_timeout(2000)

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

        mobile_page.goto(
            url,
            wait_until="domcontentloaded",
            timeout=30000
        )

        mobile_page.wait_for_timeout(2000)

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