import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Handles Base64 receipt images cleanly
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database cache for setup testing
let localLedgerCache = [];

// API: Handle Registration with Base64 receipt upload
app.post('/api/register', (req, res) => {
    try {
        const { fullName, phoneNumber, archdeaconry, homeChurch, ticketType, isOfficial, receiptImage } = req.body;
        
        if (!fullName || !phoneNumber || !receiptImage) {
            return res.status(400).json({ error: 'Missing critical registration or receipt parameters.' });
        }

        const newRegistration = {
            id: Date.now().toString(),
            fullName,
            phoneNumber,
            archdeaconry,
            homeChurch,
            ticketType,
            isOfficial,
            receiptImage, // Base64 raw image string
            approved: false,
            timestamp: new Date().toLocaleString()
        };

        localLedgerCache.push(newRegistration);
        res.status(201).json({ success: true, message: 'Registration securely logged.' });
    } catch (err) {
        res.status(500).json({ error: 'Internal processing error inside storage gateway.' });
    }
});

// API: Retrieve All Registrations for Admin Dashboard
app.get('/api/attendees', (req, res) => {
    res.json(localLedgerCache);
});

// API: Approve a Specific Delegate
app.post('/api/approve/:id', (req, res) => {
    const { id } = req.params;
    const attendee = localLedgerCache.find(person => person.id === id);
    
    if (attendee) {
        attendee.approved = true;
        return res.json({ success: true, message: 'Delegate status flipped to verified status.' });
    }
    res.status(404).json({ error: 'Target record missing.' });
});

// Serving administrative panel view Delivery
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Express v5 Foolproof Catch-All: Catch everything else using an absolute path middleware
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 System live operational pipeline initialized at: http://localhost:3000`);
});