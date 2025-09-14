import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { InterviewService } from "./services/interviewService";
import { ExcelProcessor } from "./services/excelProcessor";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    // Only allow Excel files
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Interview routes
  app.post('/api/interviews/start', async (req: any, res) => {
    try {
      // For demo purposes, use a default user ID since auth is removed
      const userId = 'demo-user';
      const session = await InterviewService.startInterview(userId);
      res.json(session);
    } catch (error) {
      console.error("Error starting interview:", error);
      res.status(500).json({ message: "Failed to start interview" });
    }
  });

  app.get('/api/interviews/:sessionId', async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await storage.getInterviewSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Interview session not found" });
      }

      const details = await InterviewService.getSessionWithDetails(sessionId);
      res.json(details);
    } catch (error) {
      console.error("Error fetching interview:", error);
      res.status(500).json({ message: "Failed to fetch interview" });
    }
  });

  app.post('/api/interviews/:sessionId/message', async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;

      const session = await storage.getInterviewSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Interview session not found" });
      }

      const result = await InterviewService.processUserMessage(sessionId, message);
      res.json(result);
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  app.post('/api/interviews/:sessionId/upload', upload.single('excel'), async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { message = '' } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const session = await storage.getInterviewSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Interview session not found" });
      }

      // Rename file with proper extension
      const originalPath = req.file.path;
      const newPath = `${originalPath}.xlsx`;
      fs.renameSync(originalPath, newPath);

      const result = await InterviewService.processUserMessage(sessionId, message, newPath);
      res.json(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get('/api/interviews/:sessionId/template/:templateType', async (req: any, res) => {
    try {
      const { sessionId, templateType } = req.params;

      const session = await storage.getInterviewSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Interview session not found" });
      }

      const templatePath = path.join(uploadDir, `template_${templateType}_${Date.now()}.xlsx`);
      await ExcelProcessor.saveTemplate(templateType, templatePath);

      res.download(templatePath, `${templateType}_template.xlsx`, (err) => {
        if (err) {
          console.error("Error downloading template:", err);
        }
        // Clean up file after download
        fs.unlink(templatePath, () => {});
      });
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });

  app.get('/api/interviews/history', async (req: any, res) => {
    try {
      // For demo purposes, return all sessions since auth is removed
      const sessions = await storage.getUserInterviewSessions('demo-user');
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching interview history:", error);
      res.status(500).json({ message: "Failed to fetch interview history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
