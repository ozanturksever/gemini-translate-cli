# gemini-translate-cli

A CLI tool to translate HTML files between languages using Google Gemini AI.

## Installation

```bash
# Using npm
npm install -g gemini-translate-cli

# Or run directly with npx (after publishing to npm)
npx gemini-translate-cli tr nl input.html output.html
```

## Setup

You need a Google Gemini API key. Get one for free at: https://aistudio.google.com/app/apikey

Set your API key as an environment variable:

```bash
export GEMINI_API_KEY=your-api-key-here
```

## Usage

```bash
gemini-translate <source-lang> <target-lang> <source-file> <output-file>
```

### Arguments

- `source-lang` - Source language code (e.g., `tr`, `en`, `de`)
- `target-lang` - Target language code (e.g., `nl`, `en`, `fr`)
- `source-file` - Path to the source HTML file
- `output-file` - Path for the translated output file

### Examples

```bash
# Translate Turkish to Dutch
gemini-translate tr nl email.html email-nl.html

# Translate English to German
gemini-translate en de page.html page-de.html

# Translate French to Spanish
gemini-translate fr es document.html document-es.html
```

## Supported Languages

The tool supports any language that Google Gemini can translate. Common language codes:

| Code | Language    | Code | Language    |
|------|-------------|------|-------------|
| en   | English     | nl   | Dutch       |
| tr   | Turkish     | de   | German      |
| fr   | French      | es   | Spanish     |
| it   | Italian     | pt   | Portuguese  |
| ru   | Russian     | zh   | Chinese     |
| ja   | Japanese    | ko   | Korean      |
| ar   | Arabic      | hi   | Hindi       |
| pl   | Polish      | uk   | Ukrainian   |
| sv   | Swedish     | da   | Danish      |
| fi   | Finnish     | no   | Norwegian   |

## Features

- Preserves HTML structure, tags, attributes, and styles
- Translates all visible text including alt text, titles, and placeholders
- Keeps URLs, email addresses, and brand names unchanged
- Maintains formatting, spacing, and indentation
- Uses Google Gemini 2.5 Flash for fast, accurate translations

## License

MIT

## Author

Ozan Turksever <ozan.turksever@gmail.com>
