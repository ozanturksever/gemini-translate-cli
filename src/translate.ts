#!/usr/bin/env node
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile, writeFile } from 'fs/promises';

// Language name mapping for common language codes
const languageNames: Record<string, string> = {
  en: 'English',
  nl: 'Dutch',
  tr: 'Turkish',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  pl: 'Polish',
  uk: 'Ukrainian',
  sv: 'Swedish',
  da: 'Danish',
  fi: 'Finnish',
  no: 'Norwegian',
  cs: 'Czech',
  el: 'Greek',
  he: 'Hebrew',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
  ro: 'Romanian',
  hu: 'Hungarian',
  bg: 'Bulgarian',
  hr: 'Croatian',
  sk: 'Slovak',
  sl: 'Slovenian',
  et: 'Estonian',
  lv: 'Latvian',
  lt: 'Lithuanian',
};

function getLanguageName(code: string): string {
  return languageNames[code.toLowerCase()] || code;
}

function printUsage(): void {
  console.log(`
gemini-translate - Translate HTML files using Google Gemini AI

Usage:
  gemini-translate <source-lang> <target-lang> <source-file> <output-file>

Arguments:
  source-lang   Source language code (e.g., tr, en, de)
  target-lang   Target language code (e.g., nl, en, fr)
  source-file   Path to the source HTML file
  output-file   Path for the translated output file

Environment:
  GEMINI_API_KEY  Required. Your Google Gemini API key.
                  Get one at: https://aistudio.google.com/app/apikey

Examples:
  gemini-translate tr nl input.html output-nl.html
  gemini-translate en de page.html page-de.html

Supported language codes:
  ${Object.entries(languageNames).map(([code, name]) => `${code} (${name})`).join(', ')}
  ...and any other language code supported by Gemini
`);
}

// Check command line arguments
if (process.argv.length !== 6) {
  printUsage();
  process.exit(1);
}

const sourceLang = process.argv[2];
const targetLang = process.argv[3];
const sourceFile = process.argv[4];
const outputFile = process.argv[5];

// Check for API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is not set');
  console.error('Please set it with: export GEMINI_API_KEY=your-api-key');
  console.error('Get your API key from: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

async function translateHTML(): Promise<void> {
  const sourceLanguage = getLanguageName(sourceLang);
  const targetLanguage = getLanguageName(targetLang);

  try {
    console.log(`Reading HTML file: ${sourceFile}`);
    const htmlContent = await readFile(sourceFile, 'utf-8');
    
    console.log('Initializing Gemini...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
      }
    });

    const prompt = `You are an expert ${sourceLanguage}→${targetLanguage} translator for HTML emails.

Translate the following HTML from ${sourceLanguage} to ${targetLanguage} while preserving the HTML exactly.

Rules:
1. Source is ${sourceLanguage}; output MUST be ${targetLanguage} only.
2. Preserve ALL HTML: tags, attributes, classes, ids, inline styles, and structure.
3. Translate EVERY visible text node: headings, paragraphs, list items, table cell text, labels (e.g., From, Date, Subject, To, Cc), summary/details content, button text, form placeholders, and any user-facing attribute values (title="", alt="", placeholder="").
4. Do NOT translate URLs, email addresses, brand names, proper nouns, or protocol/technical header keys (e.g., ARC-Seal, x-gm-thrid, message-id). Leave <script> and <style> contents unchanged.
5. Keep punctuation, capitalization, numbers, spacing, line breaks, and indentation aligned with the original. Do not paraphrase, shorten, or summarize.
6. If some segments are already in a different language (e.g., English technical tokens), preserve them unless they are UI labels as in rule 3.
7. Ensure 100% coverage: no ${sourceLanguage} words should remain anywhere in the visible output.

Return ONLY the translated HTML — no explanations, no markdown, no code fences.

HTML to translate:

${htmlContent}`;

    console.log(`Translating HTML from ${sourceLanguage} to ${targetLanguage}...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let translatedHTML = response.text();
    
    // Clean up any potential markdown code blocks that might be added
    translatedHTML = translatedHTML
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    
    console.log(`Writing translated HTML to: ${outputFile}`);
    await writeFile(outputFile, translatedHTML, 'utf-8');
    
    console.log('✓ Translation completed successfully!');
    console.log(`Output saved to: ${outputFile}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      if (error.message.includes('API key')) {
        console.error('Please check your GEMINI_API_KEY is valid');
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
    process.exit(1);
  }
}

translateHTML();
