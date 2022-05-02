//require files
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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


async function run(){
    try{

        await client.connect();
        const productCollection = client.db("riceWareHouse").collection("products");
        
        
        // api home routes
        app.get('/' , (req, res) => {
            res.send('Rice Warehouse Server Is Ready')
        })

        // api all products routes
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // api single product routes
        app.get('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = {_id: ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.send(product);
        })

    }finally{

    }
}

run().catch(console.dir);



// port listening
app.listen(port, () => {
    console.log('Listening to port, ', port);
})