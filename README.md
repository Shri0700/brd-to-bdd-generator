# AI-Powered BRD-to-BDD Test Artifact Generator

An advanced, AI-driven automation utility designed to bridge the gap between product requirements and test engineering. This tool ingests unstructured Business Requirements Documents (BRDs in PDF or Word format) and automatically generates production-ready Cucumber Gherkin feature files and TypeScript Playwright step definitions.

## 🚀 Features

- **Multi-Format Ingestion:** Automatically parses raw text from both PDF (`pdf-parse`) and Word `.docx` (`mammoth`) documents.
- **LLM-Powered Translation:** Leverages Google's Gemini API (`gemini-3.5-flash-lite`) to intelligently extract user stories, acceptance criteria, and workflows.
- **Structured Code Generation:** Outputs clean, syntactically correct Gherkin `.feature` files and Playwright-compatible TypeScript step definitions.
- **Automated Directory Structuring:** Organizes generated artifacts directly into structured `output/features/` and `output/steps/` directories.

## 🛠️ Tech Stack

- **Language:** TypeScript / Node.js
- **AI / LLM:** Google Gemini API (via OpenAI SDK wrapper)
- **Document Parsing:** `pdf-parse`, `mammoth`
- **Execution:** `tsx`

## ⚙️ Getting Started

### Prerequisites
- Node.js installed on your machine.
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/Shri0700/brd-to-bdd-generator.git](https://github.com/Shri0700/brd-to-bdd-generator.git)
   cd brd-to-bdd-generator