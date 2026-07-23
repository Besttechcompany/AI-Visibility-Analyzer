import os
import uuid


class ScreenshotService:

    @staticmethod
    def capture(browser, url: str):

        # Create unique folder
        analysis_id = str(uuid.uuid4())

        folder = os.path.join(
            "screenshots",
            analysis_id
        )

        os.makedirs(folder, exist_ok=True)

        # -----------------------
        # Desktop Screenshot
        # -----------------------

        context = browser.new_context(
            viewport={
                "width": 1440,
                "height": 900
            }
        )

        page = context.new_page()

        page.goto(
            url,
            wait_until="networkidle",
            timeout=60000
        )

        desktop_path = os.path.join(
            folder,
            "desktop.png"
        )

        page.screenshot(
            path=desktop_path,
            full_page=True
        )

        context.close()

        # -----------------------
        # Mobile Screenshot
        # -----------------------

        mobile = browser.new_context(
            viewport={
                "width": 390,
                "height": 844
            },
            is_mobile=True,
            has_touch=True
        )

        page = mobile.new_page()

        page.goto(
            url,
            wait_until="networkidle",
            timeout=60000
        )

        mobile_path = os.path.join(
            folder,
            "mobile.png"
        )

        page.screenshot(
            path=mobile_path,
            full_page=True
        )

        mobile.close()

        return {
            "analysis_id": analysis_id,
            "desktop": f"/screenshots/{analysis_id}/desktop.png",
            "mobile": f"/screenshots/{analysis_id}/mobile.png"
        }