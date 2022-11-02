const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

//middle wares

app.use(cors())
app.use(express.json())

app.get('/', (req, res) =>{
    res.send('genius car server is running')

})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ky0svg6.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
          try{
               const serviceCollection = client.db('geniusCar').collection('services')
                const oderCollection = client.db('geniusCar').collection('orders')
               app.get('/services', async(req, res) =>{
                const query = {}
                const cursor = serviceCollection.find(query)
                const services = await cursor.toArray()
                res.send(services)
               })

               app.get('/services/:id', async(req, res) =>{
                const id = req.params.id
                const query = {_id: ObjectId(id)}
                const service = await serviceCollection.findOne(query)
                res.send(service)
               })

               //orders api
               app.get('/orders', async(req, res) =>{
                let query = {}
                console.log(req.query)
                if(req.query.email){
                    query = {
                        email: req.query.email
                    }
                }
                const cursor = oderCollection.find(query)
                const orders = await cursor.toArray()
                res.send(orders)
               })

               app.post('/orders', async(req, res) =>{
                const order = req.body
                const result = await oderCollection.insertOne(order)
                res.send(result)
               })
          }
          finally{

          }
}
run().catch(err => console.log(err))

app.listen(port, ()=>{
    console.log(`Genius car server running on ${port}`)
})