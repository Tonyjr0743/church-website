import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import pathModule from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(pathModule.join(__dirname, 'public')));

// 🔐 SECURE DATABASE CONNECTION
// This uses your specific MongoDB Atlas credentials
const mongoURI = "mongodb+srv://anthonynnagozie72_db_user:zQRs7jHvJL2SecW2@cluster0.gzyzw7o.mongodb.net/asm2026?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("💾 MongoDB Pipeline Connected Securely & Operational!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

const attendeeSchema = new mongoose.Schema({
    fullName: String,
    phoneNumber: String,
    archdeaconry: String,
    homeChurch: String,
    ticketType: String,
    isOfficial: String,
    receiptImage: String, 
    approved: { type: Boolean, default: false },
    regNumber: String, 
    timestamp: { type: String, default: () => new Date().toLocaleString() }
});

const Attendee = mongoose.model('Attendee', attendeeSchema);

// API: Handle Registration
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, phoneNumber, archdeaconry, homeChurch, ticketType, isOfficial } = req.body;
        const rawImage = req.body.receiptImage || req.body.receipt || req.body.proofOfPayment || req.body.paymentSlip;

        if (!fullName || !phoneNumber) {
            return res.status(400).json({ error: 'Missing critical registration parameters.' });
        }

        const count = await Attendee.countDocuments();
        const nextRegNo = `ASM-2026-${1001 + count}`;

        const newRegistration = new Attendee({
            fullName,
            phoneNumber,
            archdeaconry: archdeaconry || 'Not Specified',
            homeChurch: homeChurch || 'Not Specified',
            ticketType: ticketType || 'General Access',
            isOfficial: isOfficial || 'No',
            receiptImage: rawImage || '', 
            regNumber: nextRegNo
        });

        await newRegistration.save();
        res.status(201).json({ success: true, message: 'Registration permanently logged.' });
    } catch (err) {
        console.error("❌ DATABASE SAVE FAILURE:", err.message);
        res.status(500).json({ error: 'Internal processing error.', details: err.message });
    }
});

// API: Retrieve All Registrations (Protected by admin passkey)
app.get('/api/attendees', async (req, res) => {
    try {
        const token = req.query.key;
        if (token !== 'ogbaru2026') {
            return res.status(403).json({ error: 'Unauthorized gateway access.' });
        }
        const attendees = await Attendee.find({});
        res.json(attendees);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve ledger.' });
    }
});

// API: Approve Status (Protected by admin passkey)
app.post('/api/approve/:id', async (req, res) => {
    try {
        const token = req.query.key;
        if (token !== 'ogbaru2026') {
            return res.status(403).json({ error: 'Unauthorized gateway access.' });
        }

        const { id } = req.params;
        const attendee = await Attendee.findById(id);
        
        if (attendee) {
            attendee.approved = true;
            await attendee.save();
            return res.json({ success: true, message: 'Status updated.', data: attendee });
        }
        res.status(404).json({ error: 'Target record missing.' });
    } catch (err) {
        res.status(500).json({ error: 'Database update failed.' });
    }
});

// Serving administrative panel
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