const express = require('express');
const { logger } = require('../config/logger');
const { uploadImageToCloudflare } = require('../utils/cdn');
const { verifyUser } = require('../utils/jwtUtils');

const utilsRouter = express.Router();

utilsRouter.get('/upload-image', verifyUser, async (req, res) => {
    try {
        const imageFile = req.body.imageFile;
        const imageUrl = await uploadImageToCloudflare(imageFile);
        res.status(200).json({ imageUrl });
    } catch (error) {
        logger.error(`Error uploading image: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});