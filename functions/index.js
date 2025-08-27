
const { onCall } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, serverTimestamp } = require("firebase-admin/firestore");
const { onUserCreate } = require("firebase-functions/v2/auth");
const { logger } = require("firebase-functions");

initializeApp();
const db = getFirestore();

// Data for seeding, based on the frontend initialUsers
const initialUsers = [
    { id: 'USR001', name: 'عبدالحي', email: 'a@1.com', role: 'مشرف فرع', branch: 'فرع لبن' },
    { id: 'USR002', name: 'محمود عماره', email: 'm@1.com', role: 'موظف', branch: 'فرع لبن' },
    { id: 'USR003', name: 'علاء ناصر', email: 'alaa@1.com', role: 'موظف', branch: 'فرع لبن' },
    { id: 'USR004', name: 'السيد', email: 's@1.com', role: 'موظف', branch: 'فرع لبن' },
    { id: 'USR005', name: 'محمد إسماعيل', email: 'm1@1.com', role: 'مشرف فرع', branch: 'فرع طويق' },
    { id: 'USR006', name: 'محمد ناصر', email: 'mn@1.com', role: 'موظف', branch: 'فرع طويق' },
    { id: 'USR007', name: 'فارس', email: 'f@1.com', role: 'موظف', branch: 'فرع طويق' },
    { id: 'USR008', name: 'السيد (طويق)', email: 's17@1.com', role: 'موظف', branch: 'فرع طويق' },
    { id: 'USR009', name: 'سالم الوادعي', email: 'w@1.com', role: 'شريك', branch: 'كافة الفروع' },
    { id: 'USR010', name: 'عبدالله المطيري', email: 'Ab@1.com', role: 'شريك', branch: 'كافة الفروع' },
    { id: 'USR011', name: 'سعود الجريسي', email: 'sa@1.com', role: 'شريك', branch: 'كافة الفروع' },
    { id: 'USR012', name: 'مدير النظام', email: 'admin@branchflow.com', role: 'مدير النظام', branch: 'كافة الفروع' },
];

/**
 * Triggered when a new user is created in Firebase Authentication.
 * Creates a corresponding user document in Firestore.
 */
exports.createUserDocument = onUserCreate(async (event) => {
    const user = event.data; // The Firebase user object.
    const email = user.email; // The email of the user.
    const uid = user.uid; // The uid of the user.

    logger.info(`New user created: ${email} (UID: ${uid})`);

    try {
        const userDocRef = db.collection('users').doc(uid);

        // Find the corresponding user data from the initialUsers array
        const initialUserData = initialUsers.find(u => u.email.toLowerCase() === email?.toLowerCase());

        if (initialUserData) {
            const newUserDoc = {
                uid: uid,
                name: initialUserData.name,
                email: email,
                role: initialUserData.role,
                branch: initialUserData.branch,
                isActive: true,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            };

            await userDocRef.set(newUserDoc);
            logger.info(`Successfully created Firestore document for user: ${uid}`);
        } else {
            logger.warn(`No initial user data found for email: ${email}. Creating a default document.`);
            // Create a default user document if not found in the mock data
            await userDocRef.set({
                uid: uid,
                email: email,
                name: user.displayName || 'New User',
                role: 'موظف', // Default role
                branch: 'غير محدد', // Default branch
                isActive: true,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });
        }
    } catch (error) {
        logger.error(`Error creating Firestore document for user ${uid}:`, error);
    }
});


// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addmessage = onCall((request) => {
  // Grab the text parameter.
  const original = request.data.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = db
      .collection("messages")
      .add({original: original});
  // Send back a message that we've succesfully written the message
  return {
    result: `Message with ID: ${writeResult.id} added.`,
  };
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeuppercase = onDocumentWritten("/messages/{documentId}", (event) => {
  // Grab the current value of what was written to Firestore.
  const original = event.data.after.data().original;

  // Access the parameter `{documentId}` with `event.params`
  logger.log("Uppercasing", event.params.documentId, original);

  const uppercase = original.toUpperCase();

  // You must return a Promise when performing asynchronous tasks inside a Functions such as
  // writing to Firestore.
  // Setting an 'uppercase' field in Firestore document returns a Promise.
  return event.data.after.ref.set({uppercase}, {merge: true});
});

exports.monthlyReset = require('./monthlyReset');
exports.backupDatabase = require('./backup');
