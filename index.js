//require files
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

/* 
    user - soumik9
    pass - TbBiOyMXtt439fF2
*/



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ricewarehouse.3kpcy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
 // const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  console.log('db connected');
  client.close();
});


// api routes

app.get('/' , (req, res) => {
    res.send('Rice Warehouse Server Is Ready')
})

// port listening
app.listen(port, () => {
    console.log('Listening to port, ', port);
})