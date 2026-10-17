import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (ext === ".pdf") {
    const data = await (pdfParse as any).default(fileBuffer);
    return data.text;
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } else {
    throw new Error(`Unsupported file format: ${ext}. Please use .pdf or .docx`);
  }
}

async function generateBddFromBrd(filePath: string) {
  console.log(`📖 Reading requirements document: ${path.basename(filePath)}...`);
  const brdText = await extractTextFromFile(filePath);

  console.log("🤖 Analyzing requirements and generating BDD artifacts via Gemini...");

  const response = await openai.chat.completions.create({
    model: "gemini-3.5-flash-lite",
    messages: [
      {
        role: "system",
        content: `You are an expert QA Automation Architect. Analyze the provided Business Requirements Document (BRD) and generate two separate code blocks:
1. A Gherkin Cucumber .feature file wrapped in standard markdown code blocks (e.g., \`\`\`gherkin ... \`\`\`).
2. A matching TypeScript Playwright step definition file wrapped in markdown code blocks (e.g., \`\`\`typescript ... \`\`\`).

Make sure to clearly separate them with descriptive headings.`
      },
      {
        role: "user",
        content: `Here is the BRD content:\n\n${brdText}`
      }
    ],
  });

  const aiOutput = response.choices[0].message.content || "";

  // Output directories setup
  const outputDir = path.join(__dirname, "output");
  const featuresDir = path.join(outputDir, "features");
  const stepsDir = path.join(outputDir, "steps");

  if (!fs.existsSync(featuresDir)) fs.mkdirSync(featuresDir, { recursive: true });
  if (!fs.existsSync(stepsDir)) fs.mkdirSync(stepsDir, { recursive: true });

  // Simple regex parsers to extract code blocks from markdown output
  const gherkinMatch = aiOutput.match(/```(?:gherkin|feature)?([\s\S]*?)```/i);
  const tsMatch = aiOutput.match(/```(?:typescript|ts)?([\s\S]*?)```[\s\S]*?```(?:typescript|ts)?([\s\S]*?)```/i) || aiOutput.match(/```(?:typescript|ts)?([\s\S]*?)```/i);

  // Save the full raw output for backup/review
  fs.writeFileSync(path.join(outputDir, "generated-bdd-output.md"), aiOutput);

  // Save individual .feature file if extracted
  if (gherkinMatch && gherkinMatch[1]) {
    const featurePath = path.join(featuresDir, "requirements.feature");
    fs.writeFileSync(featurePath, gherkinMatch[1].trim());
    console.log(`✅ Feature file created: ${featurePath}`);
  }

  // Save individual step definitions file if extracted
  // We grab the second code block or fallback appropriately
  const blocks = aiOutput.match(/```[a-z]*\n([\s\S]*?)```/g);
  if (blocks && blocks.length >= 2) {
    const stepsContent = blocks[1].replace(/```[a-z]*\n/, "").replace(/```/, "").trim();
    const stepsPath = path.join(stepsDir, "requirements.steps.ts");
    fs.writeFileSync(stepsPath, stepsContent);
    console.log(`✅ Step definitions file created: ${stepsPath}`);
  }

  console.log(`\n✨ Success! All artifacts successfully structured inside the /output folder.`);
}

const sampleDoc = path.join(__dirname, "input-docs", "sample-requirements.docx");

if (!fs.existsSync(sampleDoc)) {
  console.error(`❌ Error: Could not find document at ${sampleDoc}.`);
} else {
  generateBddFromBrd(sampleDoc).catch(console.error);
}