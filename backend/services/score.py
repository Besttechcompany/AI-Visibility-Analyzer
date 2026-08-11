class ScoreAnalyzer:

    @staticmethod
    def analyze(result):

        # ---------------------------------
        # Platform Scores
        # ---------------------------------

        chatgpt_score = result["chatgpt"]["score"]

        gemini_score = result["gemini"]["score"]

        claude_score = result["claude"]["score"]

        perplexity_score = result["perplexity"]["score"]

        grok_score = result["grok"]["score"]

        google_ai_mode_score = (
            result["google_ai_mode"]["score"]
        )

        deepseek_score = result["deepseek"]["score"]

        # ---------------------------------
        # Overall Score
        # ---------------------------------

        score = (

            chatgpt_score * 0.15

            + gemini_score * 0.15

            + claude_score * 0.15

            + perplexity_score * 0.15

            + grok_score * 0.15

            + google_ai_mode_score * 0.15

            + deepseek_score * 0.10

        )

        # LLMs.txt bonus

        if result["llms"]["exists"]:

            score += 5

        score = min(
            round(score),
            100
        )

        # ---------------------------------
        # Grade
        # ---------------------------------

        if score >= 95:

            grade = "A+"

        elif score >= 90:

            grade = "A"

        elif score >= 80:

            grade = "B"

        elif score >= 70:

            grade = "C"

        elif score >= 60:

            grade = "D"

        else:

            grade = "F"

        # ---------------------------------
        # Return
        # ---------------------------------

        return {

            "overall_score": score,

            "grade": grade,

            "chatgpt": chatgpt_score,

            "gemini": gemini_score,

            "claude": claude_score,

            "perplexity": perplexity_score,

            "grok": grok_score,

            "google_ai_mode": google_ai_mode_score,

            "deepseek": deepseek_score

        }