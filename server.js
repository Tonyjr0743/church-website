import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'url';
import { fileURLToPath } from 'url';
import pathModule from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.static(pathModule.join(__dirname, 'public')));

// Connect to MongoDB Atlas permanently
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("💾 MongoDB Pipeline Connected Securely"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Database Blueprint (Schema) for Permanent Storage
const attendeeSchema = new mongoose.Schema({
    fullName: String,
    phoneNumber: String,
    archdeaconry: String,
    homeChurch: String,
    ticketType: String,
    isOfficial: String,
    receiptImage: String, // Base64 raw image string
    approved: { type: Boolean, default: false },
    regNumber: String, // Dynamic Auto-Generated ID e.g., ASM-2026-1001
    timestamp: { type: String, default: () => new Date().toLocaleString() }
});

const Attendee = mongoose.model('Attendee', attendeeSchema);

// API: Handle Registration directly into MongoDB
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, phoneNumber, archdeaconry, homeChurch, ticketType, isOfficial, receiptImage } = req.body;
        
        if (!fullName || !phoneNumber || !receiptImage) {
            return res.status(400).json({ error: 'Missing critical registration parameters.' });
        }

        // Count existing records to make a sequential ticket number
        const count = await Attendee.countDocuments();
        const nextRegNo = `ASM-2026-${1001 + count}`;

        const newRegistration = new Attendee({
            fullName,
            phoneNumber,
            archdeaconry,
            homeChurch,
            ticketType,
            isOfficial,
            receiptImage,
            regNumber: nextRegNo
        });

        await newRegistration.save();
        res.status(201).json({ success: true, message: 'Registration permanently logged.' });
    } catch (err) {
        res.status(500).json({ error: 'Internal processing error inside storage gateway.' });
    }
});

// API: Retrieve All Registrations from MongoDB for Admin Panel
app.get('/api/attendees', async (req, res) => {
    try {
        const attendees = await Attendee.find({});
        res.json(attendees);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve ledger.' });
    }
});

// API: Approve a Specific Delegate & Permanent Flip Status
app.post('/api/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const attendee = await Attendee.findById(id);
        
        if (attendee) {
            attendee.approved = true;
            await attendee.save();
            return res.json({ 
                success: true, 
                message: 'Delegate status flipped to verified status.',
                data: attendee // Sending back data to construct WhatsApp pipeline link
            });
        }
        res.status(404).json({ error: 'Target record missing.' });
    } catch (err) {
        res.status(500).json({ error: 'Database update failed.' });
    }
});

// Serving administrative panel view Delivery
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(pathModule.join(__dirname, 'public', 'admin.html'));
});

// Catch-All
app.use((req, res) => {
    res.sendFile(pathModule.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 System live operational pipeline running on port ${PORT}`);
});