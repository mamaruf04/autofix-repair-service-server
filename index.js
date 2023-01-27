const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.AUTOFIX_USER}:${process.env.AUTOFIXPASS}@cluster0.ajito.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    const serviceCollection = client.db("AutoFix").collection("services");
    const ordersCollection = client.db("AutoFix").collection("orders");

    app.get("/services", async (req, res) => {
      let query = {};
      if (req.query.id) {
        query = { _id: ObjectId(req.query.id) };
        const cursor = serviceCollection.findOne(query);
        const result = await cursor;
        res.send(result);
      } else {
        const cursor = serviceCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
    });

    app.get("/orders", async (req, res) => {
      const q = req.query;
      const cursor = ordersCollection.find(q);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    app.patch("/orders/:orderId", async (req, res) => {
      const id = req.params.orderId;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "approved",
        },
      };
      const result = await ordersCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.delete("/orders/:orderId", async (req, res) => {
      const id = req.params.orderId;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running ${port}`);
});
