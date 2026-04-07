import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const knowledgeFilePath = path.join(dataDir, "knowledge.txt");

const divider = "----------------------";

export function cleanText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function formatKnowledgeEntry(title: string, date: string, content: string): string {
  return `TITLE: ${title}\nDATE: ${date}\nCONTENT: ${content}\n${divider}\n`;
}

export async function ensureKnowledgeFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(knowledgeFilePath);
  } catch {
    await fs.writeFile(knowledgeFilePath, "", "utf8");
  }
}

export async function appendToKnowledge(entry: string) {
  await ensureKnowledgeFile();
  await fs.appendFile(knowledgeFilePath, entry, "utf8");
}

export async function readKnowledge(): Promise<string> {
  await ensureKnowledgeFile();
  return fs.readFile(knowledgeFilePath, "utf8");
}

export function getRelevantNotes(knowledgeText: string, question: string): string {
  const lowerQuestion = question.toLowerCase();
  const keywords = lowerQuestion
    .split(/\W+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

  const sections = knowledgeText
    .split(divider)
    .map((part) => part.trim())
    .filter(Boolean);

  const matched = sections.filter((section) => {
    const lowerSection = section.toLowerCase();
    return keywords.some((word) => lowerSection.includes(word));
  });

  const chosenSections = matched.length > 0 ? matched : sections;
  const combined = chosenSections.join(`\n${divider}\n`);

  if (combined.length <= 10000) {
    return combined;
  }

  return combined.slice(-10000);
}

export { knowledgeFilePath };