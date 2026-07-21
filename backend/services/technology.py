from bs4 import BeautifulSoup


class TechnologyAnalyzer:

    @staticmethod
    def analyze(response, soup):

        html = response.text.lower()

        technologies = {
            "cms": [],
            "page_builder": [],
            "javascript_frameworks": [],
            "css_frameworks": [],
            "analytics": [],
            "cdn": [],
            "fonts": [],
            "security": [],
            "other": []
        }

        # -----------------------------
        # CMS
        # -----------------------------

        if "wp-content" in html or "wp-includes" in html:
            technologies["cms"].append("WordPress")

        if "drupal" in html:
            technologies["cms"].append("Drupal")

        if "joomla" in html:
            technologies["cms"].append("Joomla")

        # -----------------------------
        # Page Builders
        # -----------------------------

        if "elementor" in html:
            technologies["page_builder"].append("Elementor")

        if "wpbakery" in html:
            technologies["page_builder"].append("WPBakery")

        if "divi" in html:
            technologies["page_builder"].append("Divi")

        if "oxygen" in html:
            technologies["page_builder"].append("Oxygen Builder")

        if "bricks" in html:
            technologies["page_builder"].append("Bricks Builder")

        # -----------------------------
        # JavaScript Frameworks
        # -----------------------------

        if "__next" in html or "_next/" in html:
            technologies["javascript_frameworks"].append("Next.js")

        if "react" in html:
            technologies["javascript_frameworks"].append("React")

        if "vue" in html:
            technologies["javascript_frameworks"].append("Vue.js")

        if "angular" in html:
            technologies["javascript_frameworks"].append("Angular")

        # -----------------------------
        # CSS Frameworks
        # -----------------------------

        if "bootstrap" in html:
            technologies["css_frameworks"].append("Bootstrap")

        if "tailwind" in html:
            technologies["css_frameworks"].append("Tailwind CSS")

        if "bulma" in html:
            technologies["css_frameworks"].append("Bulma")

        if "foundation" in html:
            technologies["css_frameworks"].append("Foundation")

        # -----------------------------
        # Analytics
        # -----------------------------

        if "gtag(" in html or "google-analytics" in html:
            technologies["analytics"].append("Google Analytics")

        if "googletagmanager" in html:
            technologies["analytics"].append("Google Tag Manager")

        if "clarity.ms" in html:
            technologies["analytics"].append("Microsoft Clarity")

        if "hotjar" in html:
            technologies["analytics"].append("Hotjar")

        if "connect.facebook.net" in html:
            technologies["analytics"].append("Facebook Pixel")

        # -----------------------------
        # CDN
        # -----------------------------

        server = response.headers.get("Server", "").lower()

        if "cloudflare" in server:
            technologies["cdn"].append("Cloudflare")

        if "cloudfront" in server:
            technologies["cdn"].append("Amazon CloudFront")

        # -----------------------------
        # Fonts
        # -----------------------------

        if "font-awesome" in html:
            technologies["fonts"].append("Font Awesome")

        if "fonts.googleapis.com" in html:
            technologies["fonts"].append("Google Fonts")

        # -----------------------------
        # Security
        # -----------------------------

        if "recaptcha" in html:
            technologies["security"].append("Google reCAPTCHA")

        # -----------------------------
        # jQuery
        # -----------------------------

        if "jquery" in html:
            technologies["other"].append("jQuery")

        # -----------------------------
        # Remove duplicates
        # -----------------------------

        for key in technologies:
            technologies[key] = sorted(list(set(technologies[key])))

        return technologies