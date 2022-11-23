const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || process.env.PORT;

//middleware 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({
        message: `Server is running at ${process.env.PORT}`
    })
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.83izqje.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });

async function run() {
    try {
        console.log('database connection established')
        const categoryCollection = client.db("mobiShop").collection("categories");

        //get all categories
        app.get('/categories', async (req, res) => {
            const categories = await categoryCollection.find({}).toArray();
            res.send(categories);

        })


    }
    finally {
        //not to use
    }
}

run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running at ${process.env.PORT}`);
})
