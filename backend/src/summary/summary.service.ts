/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';

import { ConsoleLoggerService } from '../logger/console-logger.service';

@Injectable()
export class SummaryService {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext(SummaryService.name);
  }

  private getApiKey(): string {
    const apiKey = process.env.GEMINI_API_KEY;
    this.logger.debug(
      `GEMINI_API_KEY is ${apiKey ? 'set' : 'not set'}`,
      'getApiKey',
    );
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }
    return apiKey;
  }

  private async sendGeminiRequest(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(
          `Gemini API request failed: ${response.status} - ${errorData}`,
          'sendGeminiRequest',
        );
        throw new Error(`Gemini API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const resultText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        'Unable to generate summary';

      return resultText;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error generating summary: ${errorMessage}`,
        'sendGeminiRequest',
      );
      throw new Error('Failed to retrieve response from Gemini API');
    }
  }

  async generateSummary(
    text: string,
    length: 'short' | 'medium' | 'long' = 'medium',
  ): Promise<string> {
    const lengthInstructions = {
      short: 'Keep it very brief, around 2-3 sentences.',
      medium: 'Provide a moderate summary, around 1-2 paragraphs.',
      long: 'Provide a comprehensive and detailed summary.',
    };

    const prompt = `Please provide a ${length} summary of the following text intended for a collaborative HedgeDoc note. ${lengthInstructions[length]}

IMPORTANT: Use ONLY the following markdown format structure for ALL responses:
- Start with a brief intro sentence
- Use bullet points (•) for key points
- Use **bold** for important terms or emphasis
- Keep formatting CONSISTENT across all responses

Example format:
This document discusses [main topic]. Key points include:

• **First main point**: Brief explanation
• **Second main point**: Brief explanation
• **Third main point**: Brief explanation

Text to summarize:
${text}`;
    return this.sendGeminiRequest(prompt);
  }

  async checkForErrors(text: string): Promise<string> {
    const prompt = `Review the following HedgeDoc markdown note. ONLY Identify spelling mistakes and broken markdown. DO NOT provide semantic fixes and content improvements.

IMPORTANT: Use ONLY the following markdown format structure for ALL responses:
- If issues found: Use bullet points (•) with **bold** labels for issue types
- If no issues: Return exactly "✓ No issues found."
- Keep formatting CONSISTENT

Example format when issues are found:
• **Spelling**: [specific issues]
• **Markdown**: [specific issues]
• **Structure**: [specific issues]
• **Clarity**: [specific issues]

Text to review:
${text}`;
    return this.sendGeminiRequest(prompt);
  }
}
