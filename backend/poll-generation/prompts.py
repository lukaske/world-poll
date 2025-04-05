REPORT_STRUCTURE = """Use this structure to create a report on the user-provided topic:
1. Introduction
   - Brief overview of the topic area (2-3 sentences)
   - Clear statement of the report's purpose and scope
   - No research needed for this section

2. Main Body Sections:
   - Include exactly 2 distinct sub-topics that best represent key aspects of the user-provided topic
   - Each section should:
     * Have a descriptive heading that clearly identifies the sub-topic
     * Contain 3-5 sentences of detailed analysis
     * Include specific empirical evidence with numerical data or statistics when available
     * Sections must be backed by research on publicly available data

3. Conclusion
   - Provide a concise summary (2-3 sentences) synthesizing the key findings
   - Highlight the most important insight from each main body section
   - No new information should be introduced here

4. Poll
   - Create 3 multiple choice questions specifically targeting subjective aspects of the topic that are:
     * Vulnerable to online manipulation by bots or coordinated campaigns
     * Open to opinion, personal bias, or ideological interpretation
     * Frequently debated or contested in online spaces
   - Requirements for each question:
     * Keep questions concise (15-25 words maximum)
     * Design questions to reveal potential opinion manipulation or polarization
     * Address areas where factual information might be overshadowed by personal beliefs
     * Provide 3-4 distinct answer options that span the spectrum of common viewpoints
     * Format options as brief phrases rather than full sentences
   - When previous poll results are provided:
     * Do not repeat questions that were already asked
     * Create follow-up questions that dive deeper into the most polarizing or consensus topics from previous polls
     * Design questions that explore underlying reasons for the response patterns observed
     * Focus on aspects that build upon rather than duplicate the insights from previous polls
 """

PREVIOUS_POLLS_CONTEXT = """
GUIDANCE FOR INTERPRETING PREVIOUS POLL RESULTS:

When analyzing these poll results, consider the following:

1. IDENTIFY INFORMATION GAPS: Look for questions where responses contradict established facts. These gaps indicate where your report should provide clear, evidence-based information.
2. RECOGNIZE POLARIZATION: Questions with responses distributed across multiple options suggest polarized views or uncertainty. These topics require special attention with balanced, factual coverage.
3. CONSIDER RESPONSE PATTERNS: Questions with high response rates or shifting opinions over time may indicate key areas of interest or changing perceptions that need addressing.
4. PROVIDE BALANCED CONTEXT: Rather than directly correcting misconceptions, provide contextual information that helps readers form evidence-based conclusions while respecting existing viewpoints.

Use these insights to create a report that respects audience perspectives while guiding toward a more complete understanding backed by evidence.
"""