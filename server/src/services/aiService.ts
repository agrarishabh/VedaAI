import { env } from '../config/env.js';
import type { GeneratedPaper, Section, Question } from '../types/index.js';

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

function validateQuestion(q: unknown, index: number): Question {
  const question = q as Record<string, unknown>;

  if (!question || typeof question !== 'object') {
    throw new Error(`Question at index ${index} is not a valid object`);
  }

  if (typeof question.questionNumber !== 'number') {
    throw new Error(`Question at index ${index} missing questionNumber`);
  }

  if (typeof question.text !== 'string' || question.text.length === 0) {
    throw new Error(`Question at index ${index} missing or empty text`);
  }

  const validTypes = ['mcq', 'short_answer', 'long_answer', 'true_false'];
  if (!validTypes.includes(question.type as string)) {
    throw new Error(`Question at index ${index} has invalid type: ${question.type}`);
  }

  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(question.difficulty as string)) {
    throw new Error(`Question at index ${index} has invalid difficulty: ${question.difficulty}`);
  }

  if (typeof question.marks !== 'number' || question.marks <= 0) {
    throw new Error(`Question at index ${index} has invalid marks: ${question.marks}`);
  }

  const result: Question = {
    questionNumber: question.questionNumber as number,
    text: question.text as string,
    type: question.type as Question['type'],
    difficulty: question.difficulty as Question['difficulty'],
    marks: question.marks as number,
  };

  if (question.options) {
    if (!Array.isArray(question.options)) {
      throw new Error(`Question at index ${index} options must be an array`);
    }
    result.options = question.options as string[];
  }

  return result;
}

function validateSection(s: unknown, index: number): Section {
  const section = s as Record<string, unknown>;

  if (!section || typeof section !== 'object') {
    throw new Error(`Section at index ${index} is not a valid object`);
  }

  if (typeof section.title !== 'string') {
    throw new Error(`Section at index ${index} missing title`);
  }

  if (typeof section.instruction !== 'string') {
    throw new Error(`Section at index ${index} missing instruction`);
  }

  if (!Array.isArray(section.questions)) {
    throw new Error(`Section at index ${index} missing questions array`);
  }

  return {
    title: section.title,
    instruction: section.instruction,
    questions: section.questions.map((q: unknown, qi: number) => validateQuestion(q, qi)),
  };
}

function validateGeneratedPaper(data: unknown): GeneratedPaper {
  const paper = data as Record<string, unknown>;

  if (!paper || typeof paper !== 'object') {
    throw new Error('Response is not a valid object');
  }

  if (!Array.isArray(paper.sections)) {
    throw new Error('Response missing sections array');
  }

  const sections = paper.sections.map((s: unknown, i: number) => validateSection(s, i));

  const allQuestions = sections.flatMap((s) => s.questions);
  const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);
  const totalQuestions = allQuestions.length;

  return {
    sections,
    metadata: {
      totalMarks,
      totalQuestions,
      generatedAt: new Date(),
    },
  };
}

export async function generateQuestions(prompt: string): Promise<GeneratedPaper> {
  try {
    console.log('🤖 Sending prompt to OpenRouter AI...');

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not defined in environment variables');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://vedaai.com', 
        'X-Title': 'VedaAI Assessment Creator',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemma-2-9b-it:free',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Empty response from OpenRouter AI');
    }

    console.log('📝 Received response from OpenRouter AI, parsing JSON...');

    const cleanedJson = cleanJsonResponse(text);
    let parsed: unknown;

    try {
      parsed = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON.');
      console.error('Raw response (first 500 chars):', text.substring(0, 500));
      throw new Error('Failed to parse AI response as valid JSON');
    }

    const paper = validateGeneratedPaper(parsed);
    console.log(
      `✅ Generated paper with ${paper.metadata.totalQuestions} questions, ${paper.metadata.totalMarks} total marks`
    );

    return paper;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ AI generation error:', message);
    throw new Error(`AI generation failed: ${message}`);
  }
}

