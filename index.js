const express = require('express')
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

//middle wares

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('genius car server is running')

})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ky0svg6.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
         console.log(authHeader)
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        const serviceCollection = client.db('geniusCar').collection('services')
        const oderCollection = client.db('geniusCar').collection('orders')
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
            console.log(user)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        //orders api
        app.get('/orders', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {}
            console.log(req.query)
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = oderCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)
        })

        app.post('/orders', verifyJWT, async (req, res) => {
            const order = req.body
            const result = await oderCollection.insertOne(order)
            res.send(result)
        })

        app.delete('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await oderCollection.deleteOne(query)
            res.send(result)
        })

        app.patch('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const status = req.body.status
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: status
                }
            }
            const result = await oderCollection.updateOne(query, updatedDoc)
            res.send(result)

        })



    }
    finally {

    }
}
run().catch(err => console.log(err))

app.listen(port, () => {
    console.log(`Genius car server running on ${port}`)
})