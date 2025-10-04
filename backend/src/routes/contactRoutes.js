// routes/contactRoutes.js
import express from 'express';
import { User } from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

const router = express.Router();

// Normalize phone using libphonenumber-js
const normalizePhone = (phoneNo) => {
  try {
    const parsed = parsePhoneNumberWithError(phoneNo, 'IN');
    // Returns E.164 format like +919876543210
    return parsed.number;
  } catch (error) {
    // Log the specific error for debugging
    console.error(`Invalid phone number: ${phoneNo}`, error);
    return null; // Skip invalid numbers
  }
};

router.post('/sync-contacts', auth, async (req, res) => {
  try {
    const { contacts } = req.body;
    console.log("Received contacts:", contacts);

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ message: 'Invalid contacts data provided.' });
    }

    // Directly use the contacts array from the request body
    const phoneNumbers = contacts;

    // Normalize and filter out invalid numbers
    const normalizedContacts = phoneNumbers
      .map(normalizePhone)
      .filter(Boolean);
    console.log("Normalized contacts:", normalizedContacts);

    // Find which numbers are already registered as users
    const appUsers = await User.find({
      phoneNo: { $in: normalizedContacts },
    }).select('name phoneNo');
    console.log("Found app users:", appUsers);

    const appUserPhones = appUsers.map(user => user.phoneNo);

    // Filter out users who are already in the app
    const nonAppUsers = normalizedContacts.filter(
      phoneNo => !appUserPhones.includes(phoneNo)
    );

    res.json({
      friends: appUsers, 
      invitable: nonAppUsers,
    });

  } catch (error) {
    console.error('Backend contact sync error:', error);
    res.status(500).json({ message: 'Server error during contact sync.' });
  }
});

export default router;