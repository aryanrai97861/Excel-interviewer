import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ConceptualEvaluation {
  score: number;
  reasoning: string;
  strengths: string[];
  improvements: string[];
}

export interface ExplanationEvaluation {
  score: number;
  clarity: number;
  accuracy: number;
  completeness: number;
  feedback: string;
}

export interface InterviewResponse {
  response: string;
  nextQuestion?: string;
  shouldContinue: boolean;
  hints?: string[];
}

export async function evaluateConceptualAnswer(
  question: string,
  userAnswer: string,
  expectedAnswer?: string
): Promise<ConceptualEvaluation> {
  try {
    const systemPrompt = `You are an expert Excel interviewer evaluating a candidate's conceptual knowledge.
Evaluate the candidate's answer on a scale of 0-100 based on accuracy, completeness, and understanding.
Consider partial credit for incomplete but correct explanations.

Question: ${question}
${expectedAnswer ? `Expected Answer Context: ${expectedAnswer}` : ''}
Candidate Answer: ${userAnswer}

Provide a JSON response with the following structure:
{
  "score": number (0-100),
  "reasoning": "detailed explanation of the score",
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
            reasoning: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
          },
          required: ["score", "reasoning", "strengths", "improvements"],
        },
      },
      contents: userAnswer,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to evaluate conceptual answer: ${error}`);
  }
}

export async function evaluateExplanation(
  context: string,
  userExplanation: string
): Promise<ExplanationEvaluation> {
  try {
    const systemPrompt = `You are an expert evaluating Excel formula explanations and approaches.
Rate the explanation on clarity (0-100), accuracy (0-100), and completeness (0-100).
The overall score should be the weighted average: clarity * 0.3 + accuracy * 0.5 + completeness * 0.2

Context: ${context}
User Explanation: ${userExplanation}

Provide a JSON response:
{
  "score": number (0-100, overall weighted score),
  "clarity": number (0-100),
  "accuracy": number (0-100), 
  "completeness": number (0-100),
  "feedback": "specific feedback for improvement"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
            clarity: { type: "number" },
            accuracy: { type: "number" },
            completeness: { type: "number" },
            feedback: { type: "string" },
          },
          required: ["score", "clarity", "accuracy", "completeness", "feedback"],
        },
      },
      contents: userExplanation,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to evaluate explanation: ${error}`);
  }
}

export async function generateInterviewResponse(
  context: string,
  userMessage: string,
  currentQuestionIndex: number,
  totalQuestions: number
): Promise<InterviewResponse> {
  try {
    const systemPrompt = `You are an AI interviewer conducting an Excel skills assessment. 
Be professional, encouraging, and provide helpful guidance. 
Keep responses concise but informative.
Current progress: Question ${currentQuestionIndex + 1} of ${totalQuestions}

Context: ${context}
User Message: ${userMessage}

Respond as the interviewer would, and indicate if the interview should continue.
Provide a JSON response:
{
  "response": "your response as the interviewer",
  "nextQuestion": "next question if applicable",
  "shouldContinue": boolean,
  "hints": ["hint1", "hint2"] // optional hints if user is struggling
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            response: { type: "string" },
            nextQuestion: { type: "string" },
            shouldContinue: { type: "boolean" },
            hints: { type: "array", items: { type: "string" } },
          },
          required: ["response", "shouldContinue"],
        },
      },
      contents: userMessage,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to generate interview response: ${error}`);
  }
}

export async function generateFinalReport(
  overallScore: number,
  practicalScore: number,
  conceptualScore: number,
  explanationScore: number,
  behavioralScore: number,
  sessionData: any
): Promise<{ strengths: string[], improvements: string[], recommendations: string[] }> {
  try {
    const systemPrompt = `Generate a comprehensive Excel skills assessment report based on the scores and session data.
Focus on actionable insights and specific recommendations.

Overall Score: ${overallScore}%
Practical Tasks: ${practicalScore}%
Conceptual Knowledge: ${conceptualScore}%
Explanations: ${explanationScore}%
Behavioral: ${behavioralScore}%

Session Context: ${JSON.stringify(sessionData)}

Generate a JSON response:
{
  "strengths": ["specific strength 1", "specific strength 2", ...],
  "improvements": ["specific area to improve 1", "specific area to improve 2", ...],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", ...]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
          },
          required: ["strengths", "improvements", "recommendations"],
        },
      },
      contents: "Generate the report based on the provided data.",
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to generate final report: ${error}`);
  }
}
