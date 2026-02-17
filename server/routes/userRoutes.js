import express from 'express';
import { getPublishedCreations, getUserCreations, toggleLikeCreation } from '../controllers/userController.js';
import { auth } from '../middlewares/auth.js';

const userRoutes = express.Router();


userRoutes.get('/get-user-creations',auth,getUserCreations);
userRoutes.get('/get-published-creations',auth,getPublishedCreations)
userRoutes.post('/toggle-like-creation',auth,toggleLikeCreation);

export default userRoutes;