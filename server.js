const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
// MongoDB Connection
const dbURI = 'mongodb+srv://ammarzain387_db_user:1KgyuInILTptUZO3@zain.k0kvnne.mongodb.net/';

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB se successfully connect ho gaya! 🎉'))
    .catch((err) => console.log('Database connection error:', err));
// 1. User ka Structure (Schema)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 2. Blog ka Structure (Schema)
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String }
});
const Blog = mongoose.model('Blog', blogSchema);

// Frontend se aane wale data ko samajhne ke liye
app.use(express.json());
app.use(express.static('public'));
// Data save karne ke liye temporary lists (Database ki jagah)

// 1. User Registration API (Database ke sath)
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Pehle check karein ke kya is email se account pehle se bana hua hai?
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Yeh email pehle se mojood hai! Koi aur email use karein." });
        }

        // Agar nahi hai, toh naya user Database mein save karein
        const newUser = new User({ name, email, password });
        await newUser.save();

        console.log("Naya user database mein save ho gaya:", email);
        res.json({ message: "User successfully registered!" });
    } catch (error) {
        console.log("Register API Error:", error);
        res.status(500).json({ message: "Database mein error aa gaya!" });
    }
});

// 2. User Login API (Database ke sath)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Database mein check karein ke is email ka koi user hai ya nahi?
        const user = await User.findOne({ email: email });

        // Agar user na mile ya password match na kare
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Ghalat email ya password!" });
        }

        // Agar sab theek hai toh login success
        console.log("User login ho gaya:", email);
        res.json({ message: "Login successful!" });
    } catch (error) {
        console.log("Login API Error:", error);
        res.status(500).json({ message: "Database mein error aa gaya!" });
    }
});

// 3. Create Blog API (Database ke sath)
app.post('/create-blog', async (req, res) => {
    try {
        const { title, description, image } = req.body;

        // Naya blog banayen aur usay MongoDB mein save karein
        const newBlog = new Blog({ title, description, image });
        await newBlog.save();

        console.log("Naya blog database mein save ho gaya:", title);
        res.json({ message: "Blog created successfully!" });
    } catch (error) {
        console.log("Create Blog API Error:", error);
        res.status(500).json({ message: "Database mein error aa gaya!" });
    }
});

// 4. Sab blogs ko nikalne ki API (Dashboard ke liye)
app.get('/blogs', async (req, res) => {
    try {
        // Database se tamam blogs nikal lo
        const allBlogs = await Blog.find();
        res.json(allBlogs);
    } catch (error) {
        console.log("Fetch Blogs Error:", error);
        res.status(500).json({ message: "Database mein error aa gaya!" });
    }
});

// 5. Kisi ek specific blog ko ID ke zariye nikalne ki API
app.get('/blog/:id', async (req, res) => {
    try {
        // Jo ID URL mein aayegi, us ID wala blog database se dhoondo
        const singleBlog = await Blog.findById(req.params.id);
        res.json(singleBlog);
    } catch (error) {
        console.log("Single Blog Error:", error);
        res.status(500).json({ message: "Blog nahi mil saka!" });
    }
});

// Server Start karna
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});