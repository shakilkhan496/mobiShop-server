const express = require('express');
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

app.listen(port, () => {
    console.log(`Server is running at ${process.env.PORT}`);
})
