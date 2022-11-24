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
        const phonesCollection = client.db("mobiShop").collection("phones");
        const usersCollection = client.db("mobiShop").collection("users");

        //get all categories
        app.get('/categories', async (req, res) => {
            const categories = await categoryCollection.find({}).toArray();
            res.send(categories);

        })


        //------------------------------------------------------------------------------
        // app.get('/post', async (req, res) => {
        //     const data = [
        //         {
        //             "img": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80",
        //             "productName": "Iphone 14 pro",
        //             "location": "Dhaka",
        //             "resalePrice": 12000,
        //             "OriginalPrice": 20000,
        //             "useTime": "4 years",
        //             "postTime": "",
        //             "sellerName": "Shakil Khan",
        //             "isVerified": false,
        //             "sellerEmail": "test@gmail.com",
        //             "categoryId": "637e6fec8eb1b3246345e030"
        //         }
        //     ]

        //     const result = await phonesCollection.insertMany(data);
        //     res.send(result);
        // })

        //-------------------------------------------------------------------------


        //filter mobiles by categoryId
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { categoryId: id };
            const result = await phonesCollection.find(filter).toArray();
            res.send(result);
        })

        //save user info to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
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
