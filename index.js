const express = require("express");
const cors = require("cors");
const multer = require("multer");
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

app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Assuming 'usersCollection' is your MongoDB collection for users
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      // If the user with the given ID is not found, return a 404 status
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
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
    console.log(updatedUser);
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updatedUser }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
});

app.delete("/users/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

// Define routes for pixels
app.get("/pixels", async (req, res) => {
  try {
    const user = await usersCollection.find().toArray();

    const pixels = await pixelsCollection.find().toArray();
    console.log(pixels);
    const userMap = user.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});
    const newPixels = pixels.map((pixel) => ({
      ...pixel,
      userId: userMap[pixel.userId],
    }));
    res.send(newPixels);
  } catch (error) {
    res.status(500).json({ error: "Error fetching pixels" });
  }
});

app.get("/pixels/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Assuming 'pixelsCollection' is your MongoDB collection
    const pixel = await pixelsCollection.findOne({ _id: new ObjectId(id) });

    if (!pixel) {
      // If the pixel with the given ID is not found, return a 404 status
      return res.status(404).json({ error: "Pixel not found" });
    }

    res.json(pixel);
  } catch (error) {
    res.status(500).json({ error: "Error fetching pixel" });
  }
});

app.post("/pixels", async (req, res) => {
  try {
    const newPixels = req.body;
    newPixels.status = false;
    const pixels = await pixelsCollection.find().toArray();
    if (pixels.find((ob) => ob.trxid === req.body.trxid)) {
      throw new Error("trxid already exists");
    } else {
      const result = await pixelsCollection.insertOne(newPixels);
      res.status(201).json(newPixels);
    }
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

app.put("/pixels/:id", async (req, res) => {
  // try {
  const pixelId = req.params.id;
  const updatePixel = req.body;
  // console.log(pixelId,updatePixel)
  const exist = await pixelsCollection.findOne({ _id: new ObjectId(pixelId) });
  console.log(exist);
  console.log(updatePixel);

  const result = await pixelsCollection.updateOne(
    { _id: new ObjectId(pixelId) },
    {
      $set: updatePixel,
      $currentDate: { lastModified: true },
    }
  );

  console.log(result);

  //   if (result.matchedCount === 1 && result.modifiedCount === 1) {
  //     // Successfully updated one document
  //     res.json({ message: 'Pixel updated successfully' });
  //   } else {
  //     res.status(404).json({ error: 'Pixel not found or not updated' });
  //   }
  // } catch (error) {
  //   res.status(500).json({ error: 'Error updating pixel' });
  // }
});
app.delete("/pixels/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pixelsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Error deleting pixel" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
