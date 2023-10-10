import { MongoClient } from "mongodb";

const connectionString = process.env.ATLAS_URI || "mongodb+srv://force2008:wangyiH0316@cluster0.wsjlcm2.mongodb.net/?retryWrites=true&w=majority";


const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}

let db = conn.db("vercel-db");

export default db;