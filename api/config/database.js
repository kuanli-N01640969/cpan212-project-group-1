import "dotenv/config";
import mongoose, { mongo } from "mongoose";

//Mongoose treats query operators in a JSON body as plain values
//instead of executing them as MongoDB operators
mongoose.set("sanitizeFilter", true);

//Connects express to databse
export async function connectDatabase() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("MONGODB_URI is not set. Copy .env.example to .env and add your connection string.");
        process.exit(1); //quick fail if connection string unavailable
    }

    try{
        //Wait 10s instead of default 30s
        await mongoose.connect(uri, {serverSelectionTimeoutMS: 10000});
    } catch (error) {
        console.error(`Could not connect to MongoDB: ${error.message}`);
        console.error("Check connection string is in .env, verify database is running, and confirm IP in Atlas.")
    }

    console.log(`Connected to MongoDB, database"${mongoose.connection.name}"`);
}