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

  async generateSummary(text: string): Promise<string> {
    const prompt = `Please provide a concise summary of the following text intended for a collaborative HedgeDoc note:\n\n${text}`;
    return this.sendGeminiRequest(prompt);
  }

  async checkForErrors(text: string): Promise<string> {
    const prompt = `Review the following HedgeDoc markdown note. Identify spelling mistakes, broken markdown, structural issues, unclear sentences, and missing context. Respond with a short list of actionable issues. If there are no issues, respond with "No issues found."\n\n${text}`;
    return this.sendGeminiRequest(prompt);
  }
}
