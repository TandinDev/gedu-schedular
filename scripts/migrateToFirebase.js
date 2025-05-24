import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { auth, db } from './firebase-config.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read JSON files
const studentData = JSON.parse(readFileSync(join(__dirname, 'student-data.json'), 'utf8'));
const teacherData = JSON.parse(readFileSync(join(__dirname, 'teacher-data.json'), 'utf8'));

// Helper function to create student user
const createStudentUser = async (student) => {
  try {
    // Create auth user
    const email = `${student['Student ID']}@student.gedu.edu.bt`;
    const password = student['CID']; // Using CID as initial password
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      studentId: student['Student ID'],
      name: student['Name'],
      email: student['Email ID'].trim(),
      role: 'student',
      department: student['Program '].trim(),
      year: student['Year'],
      createdAt: new Date().toISOString()
    });

    console.log(`Created student: ${student['Name']}`);
  } catch (error) {
    console.error(`Error creating student ${student['Name']}:`, error.message);
  }
};

// Helper function to create lecturer user
const createLecturerUser = async (lecturer) => {
  try {
    // Create auth user
    const email = lecturer['Email ID'].trim();
    const password = lecturer['CID']; // Using CID as initial password
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: lecturer['Name'].trim(),
      email: lecturer['Email ID'].trim(),
      role: 'lecturer',
      department: lecturer['Department'].trim(),
      createdAt: new Date().toISOString()
    });

    console.log(`Created lecturer: ${lecturer['Name']}`);
  } catch (error) {
    console.error(`Error creating lecturer ${lecturer['Name']}:`, error.message);
  }
};

// Main migration function
const migrateData = async () => {
  console.log('Starting migration...');

  // Migrate students
  console.log('Migrating students...');
  for (const student of studentData) {
    await createStudentUser(student);
  }

  // Migrate lecturers
  console.log('Migrating lecturers...');
  for (const lecturer of teacherData) {
    await createLecturerUser(lecturer);
  }

  console.log('Migration completed!');
};

// Run migration
migrateData().catch(console.error); 