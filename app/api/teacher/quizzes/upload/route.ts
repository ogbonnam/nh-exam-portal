// app/api/teacher/quizzes/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import mammoth from "mammoth";
import { auth } from "@/auth";
import { PrismaClient, QuestionType } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const title = data.get("title") as string;
    const description = data.get("description") as string;
    const duration = parseInt(data.get("duration") as string);
    const yearGroup = data.get("yearGroup") as string;
    const className = data.get("className") as string;
    // Add these lines to get academic fields
    const academicYear = data.get("academicYear") as string;
    const term = data.get("term") as string;
    const subterm = data.get("subterm") as string;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), "temp");
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (error) {
      // Type guard to check if error has a code property
      const err = error as { code?: string };
      // Directory might already exist, which is fine
      if (err.code !== 'EEXIST') {
        console.error("Error creating temp directory:", error);
        return NextResponse.json(
          { message: "Failed to create temporary directory" },
          { status: 500 }
        );
      }
    }

    // Save the file temporarily
    const tempPath = join(tempDir, file.name);
    await writeFile(tempPath, buffer);

    // Extract text from the Word document
    const result = await mammoth.extractRawText({ path: tempPath });
    const text = result.value;

    // Parse the text to extract questions
    const questions = parseQuizText(text);

    if (questions.length === 0) {
      return NextResponse.json({ 
        message: "No valid questions found in the document" 
      }, { status: 400 });
    }

    // Create the quiz in the database
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        duration,
        yearGroup,
        className,
        academicYear, // Add this
        term,         // Add this
        subterm,      // Add this
        teacherId: session.user.id,
        questions: {
          create: questions,
        },
      },
    });

    // Clean up the temporary file
    import("fs").then(fs => {
      try {
        fs.unlinkSync(tempPath);
      } catch (error) {
        console.error("Error deleting temp file:", error);
      }
    });

    return NextResponse.json({ quizId: quiz.id });
  } catch (error) {
    console.error("Error uploading quiz:", error);
    return NextResponse.json(
      { message: "Failed to upload quiz" },
      { status: 500 }
    );
  }
}

// Define types for the parsed question structure
interface ParsedOption {
  text: string;
  isCorrect: boolean;
}

interface ParsedQuestion {
  text: string;
  type: QuestionType;
  points: number;
  correctAnswer: string | null;
  options: ParsedOption[];
}

// Function to parse the quiz text and extract questions
function parseQuizText(text: string): any[] {
  const lines = text.split("\n").filter(line => line.trim() !== "");
  const questions: ParsedQuestion[] = [];
  let currentQuestion: ParsedQuestion | null = null;
  let questionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this line starts a new question
    if (line.match(/^Question \d+:/i) || line.match(/^\d+\./)) {
      // Save the previous question if it exists
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      
      // Start a new question
      questionIndex++;
      currentQuestion = {
        text: line.replace(/^Question \d+:\s*/i, "").replace(/^\d+\.\s*/, ""),
        type: QuestionType.OPTIONS, // Default type
        points: 1,
        correctAnswer: null,
        options: [],
      };
    } 
    // Check for options
    else if (line.match(/^[A-Z]\./) && currentQuestion) {
      const optionText = line.replace(/^[A-Z]\.\s*/, "");
      
      currentQuestion.options.push({
        text: optionText,
        isCorrect: false, // Will be updated later
      });
    }
    // Check for the answer
    else if (line.match(/^Answer:\s*/i) && currentQuestion) {
      const answerText = line.replace(/^Answer:\s*/i, "");
      currentQuestion.correctAnswer = answerText;
      
      // Clean the answer text: remove spaces, convert to uppercase
      const cleanAnswer = answerText.replace(/\s/g, '').toUpperCase();
      
      // Split by commas and filter out empty strings
      const correctLetters = cleanAnswer.split(',').filter(letter => letter.length > 0);
      
      // If there are multiple correct answers, set the question type to CHECKBOX
      if (correctLetters.length > 1) {
        currentQuestion.type = QuestionType.CHECKBOX;
      }
      
      // Mark the correct option(s)
      currentQuestion.options.forEach((opt, index) => {
        const letter = String.fromCharCode(65 + index);
        opt.isCorrect = correctLetters.includes(letter);
      });
    }
    // Check for question type
    else if (line.match(/^Type:\s*/i) && currentQuestion) {
      const typeText = line.replace(/^Type:\s*/i, "").toUpperCase();
      if (Object.values(QuestionType).includes(typeText as QuestionType)) {
        currentQuestion.type = typeText as QuestionType;
      }
    }
  }

  // Add the last question if it exists
  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  // Format questions for Prisma
  return questions.map(q => {
    // For fill-in-the-blank, store the correct answer in the question
    if (q.type === QuestionType.FILL_IN_THE_BLANK) {
      return {
        text: q.text,
        type: q.type,
        points: q.points,
        correctAnswer: q.correctAnswer,
        options: {
          create: [] // No options for fill-in-the-blank
        }
      };
    }
    
    // For paragraph questions, no options needed
    if (q.type === QuestionType.PARAGRAPH) {
      return {
        text: q.text,
        type: q.type,
        points: q.points,
        correctAnswer: null,
        options: {
          create: [] // No options for paragraph
        }
      };
    }
    
    // For other types, create options
    return {
      text: q.text,
      type: q.type,
      points: q.points,
      correctAnswer: null,
      options: {
        create: q.options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        }))
      }
    };
  });
}