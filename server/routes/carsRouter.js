import { Router } from "express";

const router = Router();

//get all records
router.get("/", (req, res) => {
  const db = req.app.get("db"); //Access the DB object you saved within the application
  const rows = db
    .prepare(
      `
    SELECT rowid AS id, Car_name, Efficiency, Fast_charge, Price, Range, Top_speed, Acceleration
    FROM EV_cars
  `
    )
    .all(); //Gets the rowid and displays it under a new alias called id, returns all columns and up to 200 rows
  res.json(rows);
});

//create new car
router.post("/", (req, res) => {
  try {
    const db = req.app.get("db");
    //Extracts the fields from the body.
    const {
      Car_name,
      Efficiency,
      Fast_charge,
      Price,
      Range,
      Top_speed,
      Acceleration,
    } = req.body || {};
    if (!Car_name?.trim())
      return res.status(400).json({ error: "Car_name is required" });

    const info = db
      .prepare(
        `INSERT INTO EV_cars (Car_name, Efficiency, Fast_charge, Price, Range, Top_speed, Acceleration)
      VALUES (@Car_name, @Efficiency, @Fast_charge, @Price, @Range, @Top_speed, @Acceleration)`
      )
      .run({
        Car_name: Car_name.trim(),
        Efficiency,
        Fast_charge,
        Price,
        Range,
        Top_speed,
        Acceleration,
      });

    //Locates the same record by rowid and returns it.
    const car = db
      .prepare(
        `
    SELECT rowid AS id, Car_name, Efficiency, Fast_charge, Price, Range, Top_speed, Acceleration
    FROM EV_cars WHERE rowid = ?`
      )
      .get(info.lastInsertRowid);
    res.status(201).json({ message: "car created", car });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//edit car
router.put("/:id", (req, res) => {
  try {
    const db = req.app.get("db");
    const { id } = req.params; //Retrieves the ID from PARAMS
    const allowed = [
      "Car_name",
      "Efficiency",
      "Fast_charge",
      "Price",
      "Range",
      "Top_speed",
      "Acceleration",
    ];
    const body = req.body && typeof req.body === "object" ? req.body : {}; //If the BODY is not NULL and is also an object
    const fields = allowed.filter((k) => body[k] !== undefined); //List of allowed fields that have a value in the request.
    if (!fields.length)
      return res.status(400).json({ error: "no fields to update" });
    const setClause = fields.map((k) => `${k} = @${k}`).join(", "); //Updates the fields that the user submitted
    //Runs the UPDATE query with the values sent and fills in the appropriate values.
    const info = db
      .prepare(`UPDATE EV_cars SET ${setClause} WHERE rowid = @id`)
      .run({ id, ...body });
    if (!info.changes)
      return res.status(404).json({ error: "not found or no change" });
    //Return the latest information.
    const car = db
      .prepare(
        `
    SELECT rowid AS id, Car_name, Efficiency, Fast_charge, Price, Range, Top_speed, Acceleration
    FROM EV_cars WHERE rowid = ?
  `
      )
      .get(id);
    res.json({ message: "car updated", car });
  } catch (error) {
    console.error("Error updating car:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//delete car
router.delete("/:id", (req, res) => {
  try {
    const db = req.app.get("db");
    const info = db
      .prepare("DELETE FROM EV_cars WHERE rowid = ?")
      .run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: "not found" });
    res.json({ deleted: 1 });
  } catch (error) {
    console.error("Error deleting car:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
