import express from 'express';
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, pdfSummary, getJobStatus } from '../controllers/aiController.js';
import { auth } from '../middlewares/auth.js';
const aiRouter = express.Router();
import { upload } from '../configs/multer.js'
aiRouter.post('/generate-article',auth ,generateArticle);
aiRouter.post('/generate-blog-title',auth ,generateBlogTitle);
aiRouter.post('/generate-image',auth ,generateImage);
aiRouter.post('/remove-image-background', upload.single('image'), auth, removeImageBackground)
aiRouter.post('/remove-image-object', upload.single('image'), auth, removeImageObject)
aiRouter.post('/pdf-summary', upload.single('pdf'), auth, pdfSummary)
aiRouter.get('/job-status/:jobId', auth, getJobStatus);
export default aiRouter;