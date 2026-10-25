const express = require('express');
const app = express();
const PORT = 3000;

// Frontend se aane wale data ko samajhne ke liye
app.use(express.json());
app.use(express.static('public'));
// Data save karne ke liye temporary lists (Database ki jagah)
const users = [];
const blogs = [];

// 1. User Registration API (Naya account banane ke liye)
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    users.push({ name, email, password });
    console.log("Naya user add hua:", email);
    res.json({ message: "User successfully registered!" });
});

// 2. User Login API (Account check karne ke liye)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log("User login hua:", email);
        res.json({ message: "Login successful!" });
    } else {
        res.status(401).json({ message: "Galat email ya password" });
    }
});

// 3. Create Blog API (Naya blog post karne ke liye)
app.post('/create-blog', (req, res) => {
    const { title, description, image } = req.body;
    blogs.push({ title, description, image });
    console.log("Naya blog ban gaya:", title);
    res.json({ message: "Blog created successfully!" });
});

// Server Start karna
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});