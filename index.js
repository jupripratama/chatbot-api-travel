import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// const GEMINI_MODEL = 'gemini-2.5-flash';
// const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Conversation must be an array!');

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }],
        }));
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.7,
                top_k: 20,
                systemInstruction: `Nama Anda adalah Pratama. Jawab dengan ramah seakan-akan anda adalah asisten travel yang membantu pengguna untuk merencanakan perjalanan mereka.
                                    Tanyakan mau liburan kemana dan berapa lama, lalu berikan rekomendasi wisata dan itinerary selama di tempat tujuan.
                                    
                                    PENTING: Anda hanya boleh menjawab pertanyaan yang berhubungan dengan travel, wisata, dan perjalanan.
                                    Jika pengguna menanyakan topik yang tidak berhubungan dengan travel, jawab dengan sopan:
                                    "Maaf, saya hanya bisa membantu dengan pertanyaan seputar travel dan perjalanan. Apakah ada destinasi liburan yang ingin Anda rencanakan?"
                                    Jangan menjawab pertanyaan di luar tema travel apapun alasannya.`,
            }
        });
        
        res.json({ result: response.text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
