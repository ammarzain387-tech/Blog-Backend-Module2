const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "mera_secret_key_123";

// Middleware
app.use(express.json());

// Main folder se static files serve karein (Kyunke GitHub par public folder nahi hai)
app.use(express.static(__dirname));

// Main URL (/) par khulte hi login.html show karein
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// MongoDB Connection
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://ammarzain387_db_user:Zain2277@zain.k0kvnne.mongodb.net/';

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB se successfully connect ho gaya! 🎉'))
    .catch((err) => console.log('Database connection error:', err));

// 1. User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 2. Blog Schema
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    authorId: { type: String }
});
const Blog = mongoose.model('Blog', blogSchema);

// --- APIs ---

// Register API
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Yeh email pehle se mojood hai!" });
        }
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.json({ message: "User successfully registered!" });
    } catch (error) {
        console.log("Register Error:", error);
        res.status(500).json({ message: "Database mein error aa gaya!" });
    }
});

// Login API
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Ghalat email ya password!" });
        }
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Login successful!", token: token, userId: user._id });
    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).json({ message: "Database mein error aa gaya!" });
    }
});

// Create Blog API
app.post('/create-blog', async (req, res) => {
    try {
        const { title, description, image, authorId } = req.body;
        const newBlog = new Blog({ title, description, image, authorId });
        await newBlog.save();
        res.json({ message: "Blog created successfully!" });
    } catch (error) {
        console.log("Create Blog Error:", error);
        res.status(500).json({ message: "Database mein error aa gaya!" });
    }
});

// Fetch All Blogs API
app.get('/blogs', async (req, res) => {
    try {
        const allBlogs = await Blog.find();
        res.json(allBlogs);
    } catch (error) {
        console.log("Fetch Blogs Error:", error);
        res.status(500).json({ message: "Database mein error aa gaya!" });
    }
});

// Single Blog API
app.get('/blog/:id', async (req, res) => {
    try {
        const singleBlog = await Blog.findById(req.params.id);
        res.json(singleBlog);
    } catch (error) {
        console.log("Single Blog Error:", error);
        res.status(500).json({ message: "Blog nahi mil saka!" });
    }
});

// Delete Blog API
app.delete('/blog/:id', async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: "Blog successfully delete ho gaya!" });
    } catch (error) {
        console.log("Delete Error:", error);
        res.status(500).json({ message: "Blog delete nahi ho saka!" });
    }
});

// Update Blog API
app.put('/blog/:id', async (req, res) => {
    try {
        const { title, description, image } = req.body;
        await Blog.findByIdAndUpdate(req.params.id, { title, description, image });
        res.json({ message: "Blog successfully update ho gaya!" });
    } catch (error) {
        console.log("Update Error:", error);
        res.status(500).json({ message: "Blog update nahi ho saka!" });
    }
});

// Server Listen
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});