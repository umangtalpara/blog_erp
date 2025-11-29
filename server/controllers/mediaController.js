const mediaService = require('../services/mediaService');

const getUploadUrl = async (req, res) => {
  const { fileName, fileType } = req.query;

  try {
    const result = await mediaService.generateUploadUrl(fileName, fileType);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not generate upload URL' });
  }
};

module.exports = { getUploadUrl };
