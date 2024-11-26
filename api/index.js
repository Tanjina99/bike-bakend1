const express = require("express");
const { MongoClient, ServerApiVersion, deserialize } = require("mongodb");
const app = express();
const cors = require("cors");
const port = 5000;
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const saltRounds = 10;

//middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://hot-wheel-backend:hotwheel123@cluster0.zgnafjz.mongodb.net/hotWheelDB?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Specify the database and collection

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensure the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

const userCollection = client.db().collection("user");
const productCollection = client.db().collection("products");
const orderCollection = client.db().collection("orders");
const serviceCollection = client.db().collection("services");

//authentication start here
app.post("/signup", async (req, res) => {
  const { fullName, imageUrl, email, password, role } = req.body;
  const passwordHashed = await bcrypt.hash(password, saltRounds);
  const newUser = {
    fullName,
    imageUrl,
    email,
    password: passwordHashed,
    role,
  };
  const result = await userCollection.insertOne(newUser);
  res.send({
    data: result,
    status: 200,
    message: "New user created successfully",
  });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await userCollection.findOne({ email: email });
  // console.log(user);
  if (!user) {
    return res.status(404).send({ statue: 404, message: "user not found" });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (isPasswordMatched) {
    res.send({
      data: user,
      status: 200,
      message: "Logged in Successfully",
    });
  } else {
    res.status(404).send({ statue: 404, message: "Invalid credentials" });
  }
});
//authentication end here

//products starts here

//single product
app.post("/create-product", async (req, res) => {
  // const { name, msrp, image, engine, horsepower, torque, weight } =
  //   req.body;
  // const newProduct = { //dont repeat the code
  //   prodyctname,
  //   msrp,
  //   image,
  //   engine,
  //   horsepower,
  //   torque,
  //   weight,
  // };
  const newProduct = req.body;
  const result = await productCollection.insertOne(newProduct);
  res.send({
    data: result,
    status: 200,
    message: "product created successfully",
  });
});

//get all product
app.get("/all-products", async (req, res) => {
  try {
    const result = await productCollection.find({}).toArray();
    res.send({
      data: result,
      status: 200,
      message: "Products fetched successfully",
    });
  } catch (error) {
    res.status(404).send({
      status: 404,
      message: "Error finding products",
    });
  }
});

//get single product object id
app.get("/all-products/:id", async (req, res) => {
  // const objectId = req.params <-- we can skip this process when we destructing th id
  const { id } = req.params;
  try {
    const result = await productCollection.findOne({
      _id: new ObjectId(id),
    });
    res.send({
      data: result,
      statue: 200,
      message: "Single product retrive successfully",
    });
  } catch (error) {
    res.status(404).send({
      status: 404,
      message: "Error retriving single product",
    });
  }
});

//deleting product by object id
app.delete("/all-products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await productCollection.deleteOne({
      _id: new ObjectId(id), // Correctly handling the ObjectId for MongoDB
    });

    res.send({
      data: result,
      status: 200,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error); // Log error if any
    res.status(404).send({
      status: 404,
      message: "Error deleting the product",
    });
  }
});

//update product using object id
app.put("/all-products/:id", async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters
  const filter = { _id: new ObjectId(id) }; // Convert string ID to ObjectId
  const updatedProduct = req.body;

  const updatedDocument = {
    $set: {
      productname: updatedProduct.productname,
      MSRP: updatedProduct.MSRP,
      image: updatedProduct.image,
      Engine: updatedProduct.Engine,
      Horsepower: updatedProduct.Horsepower,
      Torque: updatedProduct.Torque,
      Weight: updatedProduct.Weight,
    },
  };
  const result = await productCollection.updateOne(filter, updatedDocument);
  res.send({
    data: result,
    status: 200,
    message: "Product updated successfully",
  });
});

//order route
app.post("/order", async (req, res) => {
  const newOrder = req.body;
  const result = await orderCollection.insertOne(newOrder);
  res.send({
    data: result,
    status: 200,
    message: "Order created successfully",
  });
});

app.get("/cart-list", async (req, res) => {
  const { email } = req.query;
  try {
    const result = await orderCollection.find({ email: email }).toArray();

    res.send({
      data: result,
      status: 200,
      message: "Order fetched successfully",
    });
  } catch (error) {
    res.status(404).send({
      status: 404,
      message: "Error finding products",
    });
  }
});

app.delete("/order/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await orderCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send({
      data: result,
      status: 200,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(404).send({
      status: 404,
      message: "Error deleting the order",
    });
  }
});

//create the service
//get all services
//get single services
//update service
//delete a service
//service starts here

//create single service
app.post("/create-service", async (req, res) => {
  const newService = req.body;
  const result = await serviceCollection.insertOne(newService);
  res.send({
    data: result,
    status: 200,
    message: "Service created successfully",
  });
});

//get all services data
app.get("/services", async (req, res) => {
  try {
    const result = await serviceCollection.find({}).toArray();
    res.send({
      data: result,
      status: 200,
      message: "Services data fetched successfully",
    });
  } catch (error) {
    res.status(404).send({
      status: 404,
      message: "Error finding services",
    });
  }
});

//get single service by object id
app.get("/services/:id", async (req, res) => {
  // const objectId = req.params <-- we can skip this process when we destructing th id
  const { id } = req.params;
  try {
    const result = await serviceCollection.findOne({
      _id: new ObjectId(id),
    });
    res.send({
      data: result,
      statue: 200,
      message: "Single service retrive successfully",
    });
  } catch (error) {
    res.status(404).send({
      status: 404,
      message: "Error retriving single service",
    });
  }
});

//deleting service by object id
app.delete("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await serviceCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send({
      data: result,
      status: 200,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(404).send({
      status: 404,
      message: "Error deleting the product",
    });
  }
});

//update service using object id
app.put("/services/:id", async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters
  const filter = { _id: new ObjectId(id) }; // Convert string ID to ObjectId
  const updatedService = req.body;

  const updatedDocument = {
    $set: {
      title: updatedService.title,
      description: updatedService.description,
      image: updatedService.image,
      price_range: updatedService.price_range,
    },
  };

  const result = await serviceCollection.updateOne(filter, updatedDocument);
  res.send({
    data: result,
    status: 200,
    message: "Service updated successfully",
  });
});

app.get("/", (req, res) => {
  res.send("Hello World! What's up?");
});

// Start the server
// const server = app
//   .listen(port, () => {
//     console.log(`Example app listening on port ${port}`);
//   })
//   .on("error", (err) => {
//     if (err.code === "EADDRINUSE") {
//       console.log(
//         `Port ${port} is already in use. Please make sure the server is stopped.`
//       );
//     } else {
//       console.error("Server error:", err);
//     }
//   });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
