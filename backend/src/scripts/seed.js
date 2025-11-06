import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

dotenv.config();

const seedEvents = [
  {
    name: "Communication Skills Master Class",
    description: "Join TJ Walker in this comprehensive communication skills course that will transform your personal and professional interactions.",
    venue: "Online",
    date: new Date("2024-06-15"),
    capacity: 100,
    createdBy: "admin"
  },
  {
    name: "Public Speaking Workshop", 
    description: "Learn to captivate your audience with proven public speaking techniques from industry experts.",
    venue: "Convention Center",
    date: new Date("2024-07-20"),
    capacity: 50,
    createdBy: "admin"
  },
  {
    name: "Leadership Communication",
    description: "Develop the communication skills needed to lead teams effectively and inspire action.",
    venue: "Business District Hall", 
    date: new Date("2024-08-10"),
    capacity: 80,
    createdBy: "admin"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Add sample events
    await Event.insertMany(seedEvents);
    console.log('Sample events added successfully');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();