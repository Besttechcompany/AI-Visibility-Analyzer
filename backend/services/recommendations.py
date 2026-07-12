class RecommendationAnalyzer:

    @staticmethod
    def analyze(result):

        recommendations = []

        # llms.txt
        if not result["llms"]["exists"]:
            recommendations.append(
                "Create an llms.txt file to help AI systems understand your website."
            )

        # ChatGPT
        recommendations.extend(
            result["chatgpt"]["recommendations"]
        )

        # Gemini
        recommendations.extend(
            result["gemini"]["recommendations"]
        )

        # Claude
        recommendations.extend(
            result["claude"]["recommendations"]
        )

        # Perplexity
        recommendations.extend(
            result["perplexity"]["recommendations"]
        )

        # Remove duplicates
        recommendations = list(dict.fromkeys(recommendations))

        return recommendations