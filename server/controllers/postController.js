const postService = require('../services/postService');

const createPost = async (req, res) => {
  const { title, content, coverImage, status } = req.body;
  const userId = req.user.userId;

  try {
    const result = await postService.createPost(userId, title, content, coverImage, status);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create post' });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user.userId;

  try {
    const result = await postService.updatePost(id, userId, updates);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Post not found or unauthorized') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Could not update post' });
    }
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await postService.deletePost(id, userId);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Post not found or unauthorized') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Could not delete post' });
    }
  }
};

const getPublicPosts = async (req, res) => {
  const apiKey = req.headers['x-cms-api-key'];
  if (!apiKey) return res.status(400).json({ error: 'API Key required' });

  try {
    const posts = await postService.getPostsByApiKey(apiKey);
    if (!posts) return res.status(404).json({ error: 'Invalid API Key' });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch posts' });
  }
};

const getUserPosts = async (req, res) => {
  const userId = req.user.userId;

  try {
    const posts = await postService.getPostsByUserId(userId);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch posts' });
  }
};

module.exports = { createPost, updatePost, deletePost, getPublicPosts, getUserPosts };
