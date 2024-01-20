import { config } from "dotenv";

config();

export const { MONGODB_URI, PORT } = process.env;
