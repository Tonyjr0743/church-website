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
// 50mb limit ensures high-resolution phone camera photos of receipts save smoothly
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(pathModule.join(__dirname, 'public')));

// 🔐 AUTOMATIC DATABASE HANDSHAKE
// This line automatically checks whatever variable name you used to store your link on Render
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

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

// Handle Registration Flow
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, phoneNumber, archdeaconry, homeChurch, ticketType, isOfficial } = req.body;
        
        // Highly adaptive image matching to catch whatever name the frontend form uses
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

// Retrieve Manifest Ledger
app.get('/api/attendees', async (req, res) => {
    try {
        const attendees = await Attendee.find({});
        res.json(attendees);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve ledger.' });
    }
});

// Process Approval
app.post('/api/approve/:id', async (req, res) => {
    try {
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

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(pathModule.join(__dirname, 'public', 'admin.html'));
});

app.use((req, res) => {
    res.sendFile(pathModule.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 System live operational pipeline running on port ${PORT}`);
});import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import pathModule from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// 50mb limit ensures high-resolution phone camera photos of receipts save smoothly
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(pathModule.join(__dirname, 'public')));

// 🔐 AUTOMATIC DATABASE HANDSHAKE
// This line automatically checks whatever variable name you used to store your link on Render
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

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

// Handle Registration Flow
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, phoneNumber, archdeaconry, homeChurch, ticketType, isOfficial } = req.body;
        
        // Highly adaptive image matching to catch whatever name the frontend form uses
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

// Retrieve Manifest Ledger
app.get('/api/attendees', async (req, res) => {
    try {
        const attendees = await Attendee.find({});
        res.json(attendees);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve ledger.' });
    }
});

// Process Approval
app.post('/api/approve/:id', async (req, res) => {
    try {
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

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(pathModule.join(__dirname, 'public', 'admin.html'));
});

app.use((req, res) => {
    res.sendFile(pathModule.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 System live operational pipeline running on port ${PORT}`);
});