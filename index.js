const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 8000;

// middlewares
app.use(cors());
app.use(express.json());

// Database Connection
const uri = process.env.DB_URI;
console.log(uri);
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        const homesCollection = client.db('aircncdb').collection('homes');
        const usersCollection = client.db('aircncdb').collection('users');
        const bookingsCollection = client.db('aircncdb').collection('bookings');

        // put for users login
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options,
            );
            console.log(result);

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY, {
                expiresIn: '1h',
            });
            console.log(token);
            res.send({ result, token });
        });

        // booking post
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
            console.log(result);
        });

        // get all bookings for user
        app.get('/bookings', async (req, res) => {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = {
                    guestEmail: email,
                };
            }
            const result = await bookingsCollection.find(query).toArray();
            console.log(result);
            res.send(result);
        });

        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray();
            console.log(users);
            res.send(users);
        });

        // get user role (requested)
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log(user);
            res.send(user);
        });

        app.post('/homes', async (req, res) => {
            const homeData = req.body;
            const result = await homesCollection.insertOne(homeData);
            res.send(result);
            console.log(result);
        });

        console.log('Database Connected...');
    } finally {
    }
}

run().catch((err) => console.error(err));

app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.listen(port, () => {
    console.log(`Server is running...on ${port}`);
});
