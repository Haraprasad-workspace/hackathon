require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
    origin: "https://smart-ewasterajkot.vercel.app", // Allow frontend domain
    methods: "GET,POST",
    allowedHeaders: "Content-Type"
}));

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("⚠️ Warning: API_KEY is missing in .env file!");
}

app.post('/chatbot', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ reply: "Message cannot be empty." });
        }

        // System Prompt
        const systemPrompt = "You are an expert in e-waste recycling and disposal in India. Answer user queries with clear, factual responses related to e-waste. If the question is not about e-waste, politely guide the user towards e-waste-related topics. Also, have complete information regarding the policies of CPCB India and GPCB Gujarat. Remember that your user is most probably a rural person, so guide accordingly. Keep responses short, crisp, and accurate.";

        const payload = {
            contents: [
                {
                    parts: [
                        { text: systemPrompt },  // Your prompt here
                        { text: `User: ${userMessage}\nBot:` }  // User input
                    ]
                }
            ]
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            payload,
            { headers: { "Content-Type": "application/json" } }
        );

        if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
            return res.status(500).json({ reply: "No response from AI. Please try again." });
        }

        const botReply = response.data.candidates?.[0]?.content?.parts?.map(part => part.text).join(" ") || "Sorry, I didn't understand.";
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ reply: "Error processing your request." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
