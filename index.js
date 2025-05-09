require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.i1uhr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const plantNetCollection = client.db("usersCollection").collection("users");
    const addPlantNetCollection = client.db("planetCollection").collection("plantNet");
    const plantNetOrderCollection = client.db("orderCollection").collection("order");

    app.post('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = req.body;
      const isExist = await plantNetCollection.findOne(query);
      if (isExist) {
        return res.send(isExist);
      }
      const result = await plantNetCollection.insertOne({ ...user, role: 'customer', timestamp: Date.now() })
      res.send(result)
    })

    app.post('/plants', async (req, res) => {
      const plant = req.body;
      const result = await addPlantNetCollection.insertOne(plant);
      res.send(result);
    })
    app.get('/plants', async (req, res) => {
      const result = await addPlantNetCollection.find().toArray();
      res.send(result);
    })

    app.get('/plant/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addPlantNetCollection.findOne(query);
      res.send(result);
    })

    app.post('/order', async (req, res) => {
      const order = req.body;
      console.log(order);
      const result = await plantNetOrderCollection.insertOne(order);
      res.send(result);
    })

    app.patch('/plants/quantity/:id', async (req, res) => {
      const id = req.params.id;
      const { quantityUpdate, status } = req.body;
      const filter = { _id: new ObjectId(id) };
      let updatedDoc = {
        $inc: {
          quantity: -quantityUpdate
        }
      }
      if (status === 'increase') {
        updatedDoc = {
          $inc: {
            quantity: quantityUpdate
          }
        }
      }
      const result = await addPlantNetCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    // order data get by specific user 
    app.get('/customer-order/:email', async (req, res) => {
      const email = req.params.email;
      const query = { 'customer.email': email };
      const result = await plantNetOrderCollection.find(query
      ).toArray();
      res.send(result);
    })

    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const order = await plantNetOrderCollection.findOne(query);

      if (order.status === 'Delivered') {
        return res.status(409).send('Not Canceleation proces excute');
      }
      const result = await plantNetOrderCollection.deleteOne(query);
      res.send(result);
    })

    app.patch('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await plantNetCollection.findOne(query);
      if(!user || user?.status === 'Requested')
        return res.status(400).send('You have already requested, wait for some time.');

        const updatedDoc = {
          $set : {
            status : 'Requested'
          }
        }
        const result = await plantNetCollection.updateOne(query, updatedDoc);
        res.send(result);
        console.log(result);
        
   
    })

    // user role route
    app.get('/users/role/:email' , async (req, res) =>{
      const email = req.params.email;
      const id = {email}
      const result = await plantNetCollection.findOne(id)
      res.send(result);
    }) 

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('PlantNet!')
})
app.listen(port, () => {
  console.log(`PlantNet on port ${port}`)
})
