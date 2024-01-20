import mongoose from "mongoose";
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import router from './express_router.js';
import { MONGODB_URI, PORT } from './dotenv.js';
import { socketConnection } from "./socket/index.js";

const configExpress = async () => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200,
  }));
  app.use(express.json());
  
  // Routes
  app.use(router);

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  const httpServer = createServer(app);

  try {
     httpServer.listen(PORT || 5000);
    console.log(`Listening on port ${PORT || 5000}`);
  } catch (error) {
    console.error("Error starting the server:", error);
  }

  const io = new Server(httpServer);

  socketConnection(io);
};

const configDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the DB");
  } catch (error) {
    console.error("Error connecting to the DB:", error);
    process.exit(1); // Exit the process on a critical error
  }
};

configExpress();
configDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, throw the error or handle it appropriately
});
