class ScoreAnalyzer:

    @staticmethod
    def analyze(result):

        score = 0

        score += result["chatgpt"]["score"] * 0.30
        score += result["gemini"]["score"] * 0.25
        score += result["claude"]["score"] * 0.20
        score += result["perplexity"]["score"] * 0.20

        if result["llms"]["exists"]:
            score += 5

        score = round(score)

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

        return {

            "overall_score": score,

            "grade": grade,

            "chatgpt": result["chatgpt"]["score"],

            "gemini": result["gemini"]["score"],

            "claude": result["claude"]["score"],

            "perplexity": result["perplexity"]["score"]

        }