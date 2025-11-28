#!/usr/bin/env bun
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile, writeFile } from 'fs/promises';
import { basename } from 'path';

// Check command line arguments
if (process.argv.length !== 4) {
  console.error('Usage: bun translate.ts <source-html-file> <output-html-file>');
  console.error('Example: bun translate.ts test.html test-nl.html');
  process.exit(1);
}

const sourceFile = process.argv[2];
const outputFile = process.argv[3];

// Check for API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is not set');
  console.error('Please set it with: export GEMINI_API_KEY=your-api-key');
  console.error('Get your API key from: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

async function translateHTML() {
  try {
    console.log(`Reading HTML file: ${sourceFile}`);
    const htmlContent = await readFile(sourceFile, 'utf-8');
    
    console.log('Initializing Gemini 2.5 Flash...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-pro-preview',
      //model: 'gemini-2.5-flash',
      //model: 'gemini-2.5-pro',
      generationConfig: {
        //temperature: 0.3, // Lower temperature for more consistent translations
        //topP: 0.95,
        //topK: 40,
        //maxOutputTokens: 8192,
      }
    });

    const prompt = `You are an expert Turkish→Dutch translator for HTML emails.

Translate the following HTML from Turkish to Dutch while preserving the HTML exactly.

Rules:
1. Source is Turkish; output MUST be Dutch only.
2. Preserve ALL HTML: tags, attributes, classes, ids, inline styles, and structure.
3. Translate EVERY visible text node: headings, paragraphs, list items, table cell text, labels (e.g., From, Date, Subject, To, Cc), summary/details content, button text, form placeholders, and any user-facing attribute values (title="", alt="", placeholder="").
4. Do NOT translate URLs, email addresses, brand names, proper nouns, or protocol/technical header keys (e.g., ARC-Seal, x-gm-thrid, message-id). Leave <script> and <style> contents unchanged.
5. Keep punctuation, capitalization, numbers, spacing, line breaks, and indentation aligned with the original. Do not paraphrase, shorten, or summarize.
6. If some segments are already non‑Turkish (e.g., English technical tokens), preserve them unless they are UI labels as in rule 3.
7. Ensure 100% coverage: no Turkish words should remain anywhere in the visible output.

Return ONLY the translated HTML — no explanations, no markdown, no code fences.

HTML to translate:

${htmlContent}`;

    console.log('Translating HTML to Dutch...');
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
