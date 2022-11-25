const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
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


function verifyJwt(req, res, next) {
    const authorizationHeaders = req.headers.authorization;
    if (!authorizationHeaders) {
        return res.status(401).send({
            message: 'Unauthorized'
        })
    }
    const token = authorizationHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({
                message: 'Unauthorized'
            })
        }
        req.decoded = decoded;
        next();
    })

}




async function run() {
    try {
        console.log('database connection established')
        const categoryCollection = client.db("mobiShop").collection("categories");
        const phonesCollection = client.db("mobiShop").collection("phones");
        const usersCollection = client.db("mobiShop").collection("users");
        const bookingsCollection = client.db("mobiShop").collection("bookings");

        //generate JWT
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const user = await usersCollection.findOne(filter);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
                return res.send({ token: token })
            }
            res.status(403).send({
                message: 'User not found'
            });
        })

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

        //get single product by id
        app.get('/mobiles', async (req, res) => {

            let query = {};
            if (req.query._id) {
                query = {
                    _id: req.query._id
                }
            }
            filter = { _id: ObjectId(query._id) }
            console.log(query);
            const result = await phonesCollection.findOne(filter);
            res.send(result);
        })

        //save booking info to database
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result);
            console.log(result);
        })

        //get my orders 
        app.get('/myOrders', verifyJwt, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                res.status(403).send({
                    message: 'Email not verified'
                })
            }
            const filter = { buyerEmail: email };
            const result = await bookingsCollection.find(filter).toArray();
            res.send(result);
            console.log(result);
        })
        //get my products
        app.get('/myProducts', verifyJwt, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                res.status(403).send({
                    message: 'Email not verified'
                })
            }
            const filter = { sellerEmail: email };
            const result = await phonesCollection.find(filter).toArray();
            res.send(result);
            console.log(result);


        })

        //get user by email
        app.get('/user', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            // if (email !== decodedEmail) {
            //     res.status(403).send({
            //         message: 'Email not verified'
            //     })
            // }
            const filter = { email: email };
            const result = await usersCollection.findOne(filter);
            res.send(result);
            console.log(result);
        })

        //individual user admin check
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({
                isAdmin: user?.role === 'admin'
            });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            console.log(user);
            res.send({
                isSeller: user?.slot === 'seller'
            });
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            console.log(user);
            res.send({
                isUser: user?.slot === 'user'
            });
        })

        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const result = await phonesCollection.insertOne(product);
            console.log(result);

            res.send(result);
        })

        //advertisement
        app.put('/myProducts', async (req, res) => {
            const id = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertised: true
                }
            }
            const result = await phonesCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        //get advertisement data
        app.get('/advertised', async (req, res) => {
            const filter = { advertised: true };
            const result = await phonesCollection.find(filter).toArray();
            res.send(result);
        })
        //delete product
        app.delete('/delete', async (req, res) => {
            const id = req.body;
            const filter = { _id: ObjectId(id) };
            const result = await phonesCollection.deleteOne(filter);
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
