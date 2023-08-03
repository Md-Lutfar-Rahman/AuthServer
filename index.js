const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

const uri =
  "mongodb+srv://themillionactiveusers:themillionactiveusers@cluster0.tgtq6xy.mongodb.net/<YOUR_DATABASE_NAME>?retryWrites=true&w=majority";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB and store the collection references
let usersCollection;
let pixelsCollection;

(async () => {
  try {
    const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    const db = client.db("themillionactiveusers");
    console.log("Connected to MongoDB");

    usersCollection = db.collection("users");
    pixelsCollection = db.collection("pixels");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();

// Define routes for users
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const newUser = req.body;
    const users = await usersCollection.find().toArray();
    if (users.find((ob) => ob.email === req.body.email)) {
      throw new Error("User already exists");
    } else {
      const result = await usersCollection.insertOne(newUser);
      res.status(201).json({
        email: req.body.email,
        name: req.body.name,
        _id: result.insertedId,
        role: req.body.role,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

app.put("/users/edit/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = req.body;
    const result = await usersCollection.updateOne({ _id: ObjectId(userId) }, { $set: updatedUser });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
});

app.delete("/users/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await usersCollection.deleteOne({ _id: ObjectId(userId) });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

// Define routes for pixels
app.get('/pixels', async (req, res) => {
  try {
    const result = await pixelsCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Error fetching pixels" });
  }
});

app.post('/pixels', async (req, res) => {
  try {
    const pixels = req.body;
    const result = await pixelsCollection.insertOne(pixels);
    res.send(result.ops[0]);
  } catch (error) {
    res.status(500).json({ error: "Error creating pixel" });
  }
});

app.put('/pixels/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const pixel = req.body;
    const result = await pixelsCollection.updateOne({ _id: ObjectId(id) }, { $set: pixel });
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Error updating pixel" });
  }
});

app.delete('/pixels/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pixelsCollection.deleteOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Error deleting pixel" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
