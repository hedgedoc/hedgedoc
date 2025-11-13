/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { ConsoleLoggerService } from '../logger/console-logger.service';

@Injectable()
export class SummaryService {
  constructor(
    private readonly logger: ConsoleLoggerService,
  ) {
    this.logger.setContext(SummaryService.name);
  }

  async generateSummary(text: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    this.logger.debug(
      `GEMINI_API_KEY is ${apiKey ? 'set' : 'not set'}`,
      'generateSummary',
    );
    
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

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
                    text: `Please provide a concise summary of the following text:\n\n${text}`,
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
          'generateSummary',
        );
        throw new Error(`Failed to generate summary: ${response.statusText}`);
      }

      const data = await response.json();
      const summary =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Unable to generate summary';

      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error generating summary: ${errorMessage}`,
        'generateSummary',
      );
      throw new Error('Failed to generate summary from Gemini API');
    }
  }
}
