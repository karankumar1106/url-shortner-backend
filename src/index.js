import "dotenv/config";

import connectDB from "./db/index.js";
import redisClient from "./config/redis.js";
import { app } from "./app.js";

connectDB()
  .then(async() => {
    await redisClient.connect()
    const server = app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });

    server.on("error", (error) => {
      console.error("Server error: ", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.log("Connection failed !!", error);
    process.exit(1);
  });
