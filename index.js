//require files
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// jwt verification
function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
   
    if(!authHeader){
        return res.status(401).send({message: 'Unauthorized access'});
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}


// connect to mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ricewarehouse.3kpcy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{

        // connect to mongodb collection
        await client.connect();
        const productCollection = client.db("riceWareHouse").collection("products");
        const reviewCollection = client.db("riceWareHouse").collection("reviews");

        // jwt token AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
            res.send({ accessToken });
        })
        
        // api homepage
        app.get('/' , (req, res) => {
            res.send('Rice Warehouse Server Is Ready')
        })

        // api get all products and filter by page and pagination
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            let products;
            const cursor = productCollection.find(query);

            if(page || size){
                products = await cursor.skip(page*size).limit(size).toArray();
            }else{
                products = await cursor.toArray();
            }

            res.send(products);
        })

        // api get all reviews
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
         

            res.send(reviews);
        })

        // api get single product 
        app.get('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = {_id: ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        // api insert product 
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // api product stock
        app.put('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true};

            if(updatedProduct.newQuantity && updatedProduct.newSold){
                const updatedDoc = {
                    $set: {
                        quantity: updatedProduct.newQuantity,
                        sold: updatedProduct.newSold,
                    }
                }

                const result = await productCollection.updateOne(filter, updatedDoc, options);
                res.send(result);
            }else{
                const updatedDoc = {
                    $set: {
                        quantity: updatedProduct.newQuantity,
                    }
                }

                const result = await productCollection.updateOne(filter, updatedDoc, options);
                res.send(result);
            }
        })

        // api delete product
        app.delete('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // my products with JWT verification
        app.get('/my-products', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;

            if(email === decodedEmail){
                const query = { email: email };
                const cursor = productCollection.find(query);
                const myProducts = await cursor.toArray();
                res.send(myProducts);
            }else{
                res.status(403).send({ message: 'forbidden access' });
            }
        })

        // products count
        app.get('/products-count', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count });
        })
    }finally{

    }
}

run().catch(console.dir);

// port listening
app.listen(port, () => {
    console.log('Listening to port, ', port);
})