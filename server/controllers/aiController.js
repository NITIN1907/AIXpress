import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import FormData from "form-data";

import fs from "fs/promises";
import { PdfReader } from "pdfreader";
import { v2 as cloudinary } from 'cloudinary';
import { aiQueue } from "../queue/queue.js";
const ai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== "premium" && free_usage >= 10) {
            return res.json({
                success: false,
                message: "You have exhausted your free usage. Upgrade to premium plan."
            });
        }

        const response = await ai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: Math.min(length || 500, 2048),
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
        `;

        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== "premium" && free_usage >= 10) {
            return res.json({
                success: false,
                message: "You have exhausted your free usage. Upgrade to premium plan."
            });
        }

        const response = await ai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: Math.min(length || 500, 2048),
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'article')
        `;

        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const generateImage = async (req, res) => {

    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;


        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions" })
        }


        //using clipdrop api for creating the image
        const formData = new FormData()
        formData.append('prompt', prompt)
        const { data } = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY, },
            responseType: 'arraybuffer',
        })


        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;


        const { secure_url } = await cloudinary.uploader.upload(base64Image)


        await sql` INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({ success: true, content: secure_url })



    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })

    }

}



export const removeImageBackground = async (req, res) => {

    try {
        const { userId } = req.auth();
        const image = req.file;
        const plan = req.plan;


        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions" })
        }


        

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        })

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

        res.json({ success: true, content: secure_url })



    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })

    }

}
export const removeImageObject = async (req, res) => {

    try {
        const { userId } = req.auth();
        const { object } = req.body;
        const image = req.file;
        const plan = req.plan;


        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions" })
        }



        const { public_id } = await cloudinary.uploader.upload(image.path)

        // const imageUrl = cloudinary.url(public_id, {
        //     secure: true,
        //     transformation: [{effect: `gen_remove:${object}`}],
        //     resource_type: 'image'
        // })

        const imageUrl = cloudinary.url(public_id, {
            secure: true,
            transformation: [{ effect: `gen_remove:${object}` }], 
            resource_type: "image",
        });

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId},  ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

        res.json({ success: true, content: imageUrl })



    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })

    }

}
const parsePDF = (buffer) => {
    return new Promise((resolve, reject) => {
        let text = "";

        new PdfReader().parseBuffer(buffer, (err, item) => {
            if (err) return reject(err);

            if (!item) {
                // Done reading
                return resolve(text);
            }

            if (item.text) {
                text += item.text + " ";
            }
        });
    });
};

export const pdfSummary = async (req, res) => {
  try {
    const { userId } = req.auth();
    const pdfFile = req.file;
    const { mode = "detailed" } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!pdfFile) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded",
      });
    }

    if (pdfFile.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "PDF file size exceeds allowed size (5MB).",
      });
    }

   
    const upload = await cloudinary.uploader.upload(pdfFile.path, {
      resource_type: "raw",
      folder: "pdf-uploads",
    });

    
    await fs.unlink(pdfFile.path);

   
    const job = await aiQueue.add("pdf-summary", {
      userId,
      fileUrl: upload.secure_url,
      mode,
    });

    return res.status(202).json({
      success: true,
      message: "PDF summary job started",
      jobId: job.id,
    });

  } catch (error) {
    console.error("PDF Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.auth();

    const job = await aiQueue.getJob(jobId);

    console.log(job)
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const state = await job.getState();

    if (state === "completed") {
      const result = await sql`
        SELECT content
        FROM creations
        WHERE job_id = ${jobId}
        AND user_id = ${userId}
        LIMIT 1
      `;

      return res.json({
        success: true,
        status: "completed",
        content: result[0]?.content || null,
      });
    }

    if (state === "failed") {
      return res.json({
        success: false,
        status: "failed",
        message: "Job processing failed",
      });
    }

    return res.json({
      success: true,
      status: state,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
