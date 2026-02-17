// workers/worker.js

import { Worker } from "bullmq";
import "dotenv/config";
import axios from "axios";

import { connection } from "../queue/queue.js";
import deadLetterQueue from "../queue/dlq.js";
import parsePDF from "../util/parsePDF.js";
import OpenAI from "openai";
import sql from "./db.js";

const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MAX_PDF_CHARS = 16000;
const MAX_ATTEMPTS = 3;

const worker = new Worker(
  "ai-jobs",
  async (job) => {
    if (job.name !== "pdf-summary") {
      console.log(`[Job ${job.id}] Ignored job: ${job.name}`);
      return { ignored: true };
    }

    const { userId, fileUrl, mode = "detailed" } = job.data;

    // ✅ Validate fileUrl (NOT filePath anymore)
    if (!fileUrl || typeof fileUrl !== "string") {
      throw new Error("Invalid or missing fileUrl");
    }

    console.log(
      `[Job ${job.id}] Processing PDF summary | user=${userId} | mode=${mode}`
    );

    try {
      // ✅ Download PDF from Cloudinary
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });

      const pdfBuffer = Buffer.from(response.data);

      console.log(
        `[Job ${job.id}] PDF downloaded (${pdfBuffer.length} bytes)`
      );

      const pdfText = await parsePDF(pdfBuffer);

      if (!pdfText || pdfText.trim().length < 80) {
        throw new Error("PDF content too short to summarize");
      }

      const safeText = pdfText.substring(0, MAX_PDF_CHARS);

      const prompt = `
You are an expert research assistant.

Summarize the following PDF content in "${mode}" format.

Modes:
- short    → 5–7 concise lines
- detailed → structured explanation
- bullet   → bullet points
- insights → insights and implications

PDF Content:
${safeText}
`.trim();

      const responseAI = await ai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 1400,
      });

      const summary =
        responseAI?.choices?.[0]?.message?.content?.trim() || "";

      if (!summary) {
        throw new Error("AI returned empty summary");
      }

      console.log(`[Job ${job.id}] Summary generated`);

      
      await sql`
        INSERT INTO creations (
          user_id,
          prompt,
          content,
          type,
          job_id,
          created_at
        )
        VALUES (
          ${userId},
          ${`PDF Summary - ${mode}`},
          ${summary},
          'pdf-summary',
          ${job.id},
          NOW()
        )
      `;

      console.log(`[Job ${job.id}] Saved to database`);

      return {
        success: true,
        summaryLength: summary.length,
        originalTextLength: pdfText.length,
      };

    } catch (error) {
      console.error(`[Job ${job.id}] Error: ${error.message}`);

      // Permanent failure cases
      if (
        error.message.includes("too short") ||
        error.message.includes("empty summary")
      ) {
        console.error(`[Job ${job.id}] Permanent failure → discard`);
        await job.discard();
      }

   
      if (job.attemptsMade >= MAX_ATTEMPTS) {
        try {
          await deadLetterQueue.add("failed-pdf-summary", {
            originalJobId: job.id,
            userId,
            fileUrl,
            mode,
            error: {
              message: error.message,
              stack: error.stack?.substring(0, 800),
            },
            failedAt: new Date().toISOString(),
          });

          console.log(`[Job ${job.id}] Moved to DLQ`);
        } catch (dlqErr) {
          console.error(
            `[Job ${job.id}] DLQ insert failed: ${dlqErr.message}`
          );
        }
      }

      throw error;
    }
  },
  {
    connection,
    concurrency: 1,
    limiter: {
      max: 10,
      duration: 60_000,
    },
  }
);

worker.on("active", (job) => {
  console.log(`[Worker] Job ${job.id} active`);
});

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(
    `[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade})`
  );
  console.error(err.message);
});

worker.on("error", (err) => {
  console.error("[Worker] Global error:", err);
});

const shutdown = async () => {
  console.log("Shutting down PDF worker...");
  await worker.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("✅ PDF Summary Worker started (queue: ai-jobs)");
