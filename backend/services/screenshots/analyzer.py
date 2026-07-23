from .screenshot import ScreenshotService


class ScreenshotAnalyzer:

    @staticmethod
    def analyze(browser, url: str):

        return ScreenshotService.capture(browser, url)