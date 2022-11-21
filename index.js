const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken')
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

        // put for users login
      app.put('/user/:email', async (req, res) =>
      {
        const email = req.params.email
        const user = req.body
        const filter = { email: email }
        const options = { upsert: true }
        const updateDoc = {
          $set: user
        }
        const result = await usersCollection.updateOne(filter, updateDoc, options)
        console.log(result)

        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' })
        console.log(token);
        res.send({result, token}) 
        })

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
