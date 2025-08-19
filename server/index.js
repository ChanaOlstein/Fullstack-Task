import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import dotenv from "dotenv";
dotenv.config();
import carsRouter from "./routes/carsRouter.js";

// connect to DB
const db = new Database("./data/cars.db", { fileMustExist: true }); //Creating a synchronous connection to an SQLite file, error if the file does not exist.
db.pragma("foreign_keys = ON"); //

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.set("db", db); //Saves the database object on the server.
//Quickly verify that the server is up and that the DB is accessible.
app.get("/health", (_req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.json({ ok: true, db: true });
  } catch {
    res.status(500).json({ ok: false, db: false });
  }
});

app.use("/cars", carsRouter);

app.listen(3000, () =>
  console.log("server is running in port http://localhost:3000")
);
