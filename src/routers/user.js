const express = require('express')
const User = require('../models/user')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const multer = require('multer')

const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//auth middile ware olarak kullanılır
router.get('/users' ,async (req, res) => {
    try {
        const users = await User.find({})
      
        res.send({users})
    } catch (e) {
        res.status(500).send()
    }
})


router.get('/users/me', auth ,async (req, res) => {
    try {
        const users = await User.findById({_id:req.user._id})
      
        res.send({users})
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

//router.patch('/users/:id', auth , async (req, res) => {
router.patch('/users/me', auth , async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
       
        const user = req.user // await User.findById(req.params.id)
        updates.forEach((update)=> user[update] = req.body[update])
        token = await user.generateAuthToken()
        // user.tokens = token
        user.tokens.concat({ token})
        await user.save();

        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth , async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.users._id)  // auth var diye  req.users._id kulanabiliyoruz

        // if (!user) {
        //     return res.status(404).send()
        // }
        
        


        await req.user.remove()
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})



// const storage = multer.diskStorage({
//      destination: function (req, file, cb) {
//        cb(null, 'avatar')
//      },
//     filename: function (req, file, cb) {
//       //const uniqueSuffix = '.jpg'
//       const part = file.originalname.split('.')

//       cb(null, req.user._id + '.' + part[1] )
//     }
//   })

  const limits = {
    fileSize:8096000
  }

  const fileFilter = function(req, file, cb){
    if(file.originalname.match(/\.(jpg|png)$/)){
        return cb(null,true)
    }
    cb(new Error('Dosa resim olmak zorunda'))
  }
          


  const upload = multer({ 
      //storage  ,
      limits ,
      fileFilter
    })

router.post('/users/me/avatar', auth ,upload.single('avatar'), async (req, res) => {
    try {

        const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
        req.user.avatar = buffer
       
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(400).send({error:e.message})
    }
}, (error, req,res,next)=>{

    res.status(400).send({error:error.message})

})


router.delete('/users/me/avatar', auth , async (req, res) => {
    try {

        const b = Buffer.from('');
        req.user.avatar = b

        //req.user.avatar = undifined
       
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(400).send()
    }
}, (error, req,res,next)=>{

    res.status(400).send({error:error.message})

})

router.get('/users/:id/avatar' , async (req, res) => {
    try {
        console.log(req.params.id)
        const user = await User.findById(req.params.id)
        if (!user || ! user.avatar ){
           
            res.status(400).send()
        }
        
        res.set('Content-Type', 'image/png')
        console.log(user.avatar)
        res.status(201)
        res.send(user.avatar)

    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth ,async (req, res) => {
    try {
        
       

        tokens = req.user.tokens.filter((token)=>{
            return token.token!== req.token  //mevcut token dışındaki tüm tokenları getiti
        })
        req.user.tokens = tokens
        await req.user.save()
         res.send()

    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth ,async (req, res) => {
    try {

        
        req.user.tokens = []
        await req.user.save()
        res.status(200).send(user)

    } catch (e) {
        res.status(500).send()
    }
})





module.exports = router