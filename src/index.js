const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

console.log(process.env.E_MAIL)

// const multer = require('multer')
// const upload = multer({
//     dest:'images'
// })
// multer middleware 
    // app.post('/upload', upload.single('upload') ,(req,res)=>{
    //     res.send()
    // }, (error, req,res,next)=>{
    //     res.status(400).send({error:error.message})
    // })
//


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=>{
    console.log('server is up un port ' + port)
})
