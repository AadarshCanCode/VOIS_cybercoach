import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.mongo_api || process.env.MONGODB_URI;
        if (!uri) {
            console.error('Error: MongoDB URI not found in .env (mongo_api or MONGODB_URI)');
            // Don't exit process in dev, just component won't work
            return;
        }

        // Mongoose 6+ always defaults to these settings, but explicit is fine or just ommit options for newer versions
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        // process.exit(1); // Avoid crashing the whole server if mongo fails, just log it
    }
};

export default connectDB;
