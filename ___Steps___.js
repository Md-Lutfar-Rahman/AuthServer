/****
 * user Name :lutfarrahmaninfo 
 * user Password : themillionactiveusers
 * 
 * themillionactiveusers:themillionactiveusers
 * **/


    // Update the code to use the `usersCollection` and `menuCollection` collections
    const usersCollection = client.db("bistroDb").collection("users");
    const pixelsCollection = client.db("bistroDb").collection("pixels");

    // Get all users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Get all pixels
    app.get('/pixels', async (req, res) => {
      const result = await pixelsCollection.find().toArray();
      res.send(result);
    });

    // Create a new user
    app.post('/users',  async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists' })
      } else {
        const result = await usersCollection.insertOne(user)
        res.send(result);
      }
    });

    // Update an existing user
    app.put('/users/:id', async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const result = await usersCollection.updateOne({ _id: id }, { $set: user });
      res.send(result);
    });

    // Delete a user
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.deleteOne({ _id: id });
      res.send(result);
    });

    // Create a new pixel
    app.post('/pixels',  async (req, res) => {
      const pixel = req.body;
      const result = await pixelsCollection.insertOne(pixel)
      res.send(result);
    });

    // Update an existing pixel
    app.put('/pixels/:id', async (req, res) => {
      const id = req.params.id;
      const pixel = req.body;
      const result = await pixelsCollection.updateOne({ _id: id }, { $set: pixel });
      res.send(result);
    });

    // Delete a pixel
    app.delete('/pixels/:id', async (req, res) => {
      const id = req.params.id;
      const result = await pixelsCollection.deleteOne({ _id: id });
      res.send(result);
    });