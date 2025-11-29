const authService = require('../services/authService');

const register = async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.status(400).json({ error: 'Email, password, and username required' });

  try {
    const result = await authService.register(email, password, username);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not register user' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await authService.login(email, password);
    if (result) {
      res.json(result);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not login' });
  }
};

module.exports = { register, login };
