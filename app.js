'use strict'
 
const 
	express = require('express'),
    app = express(), 
    user = require('./src/UserPackage/user-main-router'),
    project = require('./src/ProjectPackage/project-main'),
    config = require('./config'),
    bodyParser = require('body-parser'),
    cors = require('cors')

    
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json())

app.use('/user',user);
app.use('/project',project);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

  
app.listen(config.port, () => {
    console.log(`Example app listening at http://localhost:${config.port}`)
})