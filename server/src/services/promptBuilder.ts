import type { AssignmentData, QuestionType } from '../types/index.js';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice Questions (MCQ)',
  short_answer: 'Short Answer Questions',
  long_answer: 'Long Answer / Essay Questions',
  true_false: 'True/False Questions',
};

export function buildPrompt(assignment: AssignmentData): string {
  const {
    title,
    subject,
    grade,
    totalMarks,
    numberOfQuestions,
    questionTypes,
    difficultyDistribution,
    duration,
    additionalInstructions,
    uploadedContent,
  } = assignment;

  const questionTypesList = questionTypes
    .map((qt) => QUESTION_TYPE_LABELS[qt])
    .join(', ');

  const sectionInstructions = questionTypes
    .map((qt, index) => {
      const sectionLetter = String.fromCharCode(65 + index); // A, B, C...
      return `- Section ${sectionLetter}: ${QUESTION_TYPE_LABELS[qt]}`;
    })
    .join('\n');

  const totalDifficultyParts =
    difficultyDistribution.easy +
    difficultyDistribution.medium +
    difficultyDistribution.hard;

  const easyCount = Math.round(
    (difficultyDistribution.easy / totalDifficultyParts) * numberOfQuestions
  );
  const mediumCount = Math.round(
    (difficultyDistribution.medium / totalDifficultyParts) * numberOfQuestions
  );
  const hardCount = numberOfQuestions - easyCount - mediumCount;

  const prompt = `You are an expert academic question paper generator. Generate a complete question paper based on the following specifications.

PAPER DETAILS:
- Title: ${title}
- Subject: ${subject}
- Grade/Level: ${grade}
- Total Marks: ${totalMarks}
- Total Questions: ${numberOfQuestions}
- Duration: ${duration} minutes
- Question Types Required: ${questionTypesList}

DIFFICULTY DISTRIBUTION:
- Easy questions: ${easyCount} (${difficultyDistribution.easy}%)
- Medium questions: ${mediumCount} (${difficultyDistribution.medium}%)
- Hard questions: ${hardCount} (${difficultyDistribution.hard}%)

SECTIONS:
Organize the paper into sections grouped by question type:
${sectionInstructions}

Each section must have:
- A clear title (e.g., "Section A", "Section B")
- An instruction line (e.g., "Attempt all questions", "Choose any 3 out of 5")
- Questions with sequential numbering across the entire paper

QUESTION REQUIREMENTS:
- For MCQ questions: provide exactly 4 options labeled as strings in an array
- For True/False questions: provide exactly 2 options ["True", "False"]
- For Short Answer questions: no options needed
- For Long Answer questions: no options needed
- Each question must have appropriate marks allocated
- The total marks across all questions must equal exactly ${totalMarks}
- Each question must be tagged with its difficulty level (easy, medium, or hard)
- Questions should be academically rigorous and appropriate for ${grade} level ${subject}

${uploadedContent ? `REFERENCE CONTENT (use this as the basis for generating questions):\n${uploadedContent}\n` : ''}
${additionalInstructions ? `ADDITIONAL INSTRUCTIONS:\n${additionalInstructions}\n` : ''}

RESPONSE FORMAT:
You MUST respond with ONLY valid JSON. Do NOT wrap the response in markdown code blocks. Do NOT include any text before or after the JSON.

The JSON must follow this exact structure:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries 1 mark.",
      "questions": [
        {
          "questionNumber": 1,
          "text": "What is...?",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["Option A", "Option B", "Option C", "Option D"]
        }
      ]
    }
  ],
  "metadata": {
    "totalMarks": ${totalMarks},
    "totalQuestions": ${numberOfQuestions},
    "generatedAt": "${new Date().toISOString()}"
  }
}

IMPORTANT RULES:
1. Respond with ONLY the JSON object, nothing else
2. Ensure all question numbers are sequential across all sections
3. Ensure total marks add up to exactly ${totalMarks}
4. Ensure total questions equal exactly ${numberOfQuestions}
5. Only include the "options" field for MCQ and True/False questions
6. Make questions clear, unambiguous, and educationally valuable`;

  return prompt;
}
