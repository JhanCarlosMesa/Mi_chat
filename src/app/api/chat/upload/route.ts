import { NextRequest } from 'next/server';
import { writeFile, mkdir, stat } from 'fs/promises';
import { join } from 'path';

// Helper function to ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = join(process.cwd(), 'uploads');
  try {
    await stat(uploadsDir);
  } catch {
    // Directory doesn't exist, create it
    await mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

// Helper function to extract text from PDF files
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamically import pdf-parse to avoid issues with ES modules
    const pdfParseModule: any = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Helper function to extract text from Word documents
async function extractTextFromWord(buffer: Buffer, filename: string): Promise<string> {
  try {
    // Dynamically import mammoth to avoid issues with ES modules
    const mammothModule: any = await import('mammoth');
    const mammoth = mammothModule.default || mammothModule;
    
    if (filename.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      // For .doc files, we'll return a placeholder since proper parsing requires more complex libraries
      return '[Content extracted from DOC file - full parsing not implemented in this demo]';
    }
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir();
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string | null;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate file type (PDF or Word documents)
    const allowedTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only PDF and Word documents are allowed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const uniqueFilename = `${sessionId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, uniqueFilename);
    
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Extract text content for storage
    let textContent = '';
    try {
      if (file.type === 'application/pdf') {
        textContent = await extractTextFromPDF(buffer);
      } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        textContent = await extractTextFromWord(buffer, file.name);
      }
    } catch (extractionError) {
      console.warn('Could not extract text from file:', extractionError);
      textContent = '[Text extraction failed]';
    }
    
    // Save file to disk
    await writeFile(filePath, buffer);
    
    // Also save extracted text content
    const textFilePath = join(uploadsDir, `${uniqueFilename}.txt`);
    await writeFile(textFilePath, textContent);
    
    // Return success response in Spanish
    return new Response(
      JSON.stringify({ 
        message: '¡Archivo subido exitosamente! Ahora puedes hacer preguntas sobre este documento.',
        filename: uniqueFilename,
        originalName: file.name,
        size: file.size,
        type: file.type
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('File upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Configure API endpoint to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};