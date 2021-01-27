'use strict'
 
const express = require('express'),
    app = express(), 
    middlewareMain = require('./src/MiddlewarePackage/middleware-main'),
    user = require('./src/UserPackage/user-main-router'),
    project = require('./src/ProjectPackage/project-main'),
    automation = require('./src/AutomationPackage/automation-main'),
    template = require('./src/TemplatePackage/template-main'),
    debug = require('./src/AutomationPackage/debug-automation'),
    fbpage = require('./src/FBPagePackage/fb-page-main'),
    backend = require('./src/BackendPackage/backend-main'),
    config = require('./config'),
    bodyParser = require('body-parser'),
    cors = require('cors')

    
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json())

app.use('/user',user);
app.use('/project',middlewareMain.isUserValid,project);
app.use('/automation',middlewareMain.isUserValid,middlewareMain.onCheckProject,automation);
app.use('/debug-automation',middlewareMain.isUserValid,middlewareMain.onCheckProject,debug);
app.use('/template',middlewareMain.isUserValid,template);
app.use('/fbpage',fbpage);
app.use('/backend', backend);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

  
app.listen(config.port, () => {
    console.log(`Example app listening at http://localhost:${config.port}`)
})
