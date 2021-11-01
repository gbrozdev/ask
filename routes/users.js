var express = require('express');
var router = express.Router();
var db = require('../connection')
var fun = require('../functions')
var ObjectId = require('mongodb').ObjectId
const cloudinary = require("cloudinary");

/* GET users listing. */
// const requiredlogin = (req,res)=>{
//   if (req.session.user) {
//       req.session.userstatus = true
//   }else{
//     req.session.userstatus = false
//   }
// }
router.get('/', async function (req, res) {
  if (req.session.loggedIN) {
    let id = req.session.user
    let user =  await db.get().collection('users').findOne({ _id: ObjectId(id) })
    let blogs = await db.get().collection('blogs').find().toArray()
    let newblog = blogs[0]
    res.render('index', { blogs,user,newblog });
  } else {
    res.redirect('/')
  }

});


router.get('/signup', (req, res) => {

  if (req.session.signupstatusfalse) {
    res.render('signup', { err: true })
  } else
    res.render('signup')
})

router.get('/blog/:id', async (req, res) => {
  let id = req.params.id
  let user =  await db.get().collection('users').findOne({ _id: ObjectId(req.session.user) })
  let blog = await db.get().collection('blogs').findOne({ _id: ObjectId(id) })
  let blogs = await db.get().collection('blogs').find().toArray()
  res.render('blog', { blogs,user,blog })
})

router.post('/signup', (req, res) => {
  fun.doSignup(req.body).then((response) => {
    if (response.signupstatus) {
      session = req.session;
      session.user = response.insertedId
      session.loggedfalse = false
      session.loggedIN = true
      res.redirect('/users/')
    } else {
      req.session.signupstatusfalse = true
      res.redirect('/users/signup/')
    }

  })

})
router.get('/login', function (req, res) {
  console.log(req.session);
  if (req.session.loggedIN) {
    res.redirect('/users/')
  }
  if (req.session.loggedfalse) {
    res.render('login', { err: true });
  } else {
    res.render('login');
  }
});

router.post('/login', (req, res) => {
  fun.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = String(response.user._id)
      req.session.loggedfalse = false
      req.session.loggedIN = true
      res.redirect('/users/')
    } else {
      req.session.loggedfalse = true

      res.redirect('/users/login');
    }
  })
})

router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/');
});


router.get('/myprofile', async function (req, res) {
  let user = await db.get().collection('users').findOne({ _id: ObjectId(req.session.user) })
  let blogs = await db.get().collection('blogs').find({ "userid": req.session.user }).toArray()
  res.render('profile', { user, blogs })
});
 


router.get('/profile/:id', async function (req, res) {
  let userid = req.params.id
  let user = await db.get().collection('users').findOne({ _id: ObjectId(req.session.user) })
  let bloguser = await db.get().collection('users').findOne({ _id: ObjectId(userid) })
  let blogs = await db.get().collection('blogs').find({ "userid": userid }).toArray()
  res.render('userprofile', { blogs, bloguser,user })
});

router.get('/newblog', async function (req, res) {
  let user = await db.get().collection('users').findOne({ _id: ObjectId(req.session.user) })
  res.render('newblog', { user })
});
router.post('/newblog', async function (req, res) {
  let blogdata = req.body
  if (!blogdata.imgurl) {
    blogdata.imgurl = 'https://images.pexels.com/photos/3293148/pexels-photo-3293148.jpeg?cs=srgb&dl=pexels-asad-photo-maldives-3293148.jpg&fm=jpg'
  }
  db.get().collection('blogs').insertOne(blogdata).then((response)=>{
    console.log(response.insertedId);
    let blog =blogdata;
    let user = db.get().collection('users').findOne({ _id: ObjectId(req.session.user) })
    res.render('blog',{blog,user})
  })
});

router.post('/search', async function (req, res) {
  console.log(req.body);
});


router.get('/edit/:id', async function (req, res) {
  let blogid = req.params.id
  let user = await db.get().collection('users').findOne({ _id: ObjectId(req.session.user) })
  let blog = await db.get().collection('blogs').findOne({ _id: ObjectId(blogid) })
  res.render('newblog', { user,blog })
});
router.post('/edit/', async function (req, res) {
  console.log(req.body);
  let blogdata = req.body
  if (!blogdata.imgurl) {
    blogdata.imgurl = 'data:image/jpeg;base64,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'
  }
  // fun.imgUpload(blogdata).then((response)=>{ //for cloudinary 
  // })
  
  let blogid = blogdata.blogid
  console.log(blogid);
  let myquery = {_id:ObjectId(blogid)}
  let newvalues = { $set: {"name":req.body.name,"title":req.body.title,"blog":req.body.blog,"imgurl":blogdata.imgurl,"section":req.body.section}}
  db.get().collection('blogs').updateOne(myquery,newvalues).then((resp)=>{
    console.log(resp);
  })
  res.redirect('/users/myprofile')

});


router.get('/delete/:id', (req, res) => {
  id = req.params.id
  db.get().collection('blogs').deleteOne({ _id: ObjectId(id) })
  res.redirect('/users/')
})

router.post('/dp', function (req, res) {
  dp = req.files
  console.log(dp);
  res.redirect('/');
});

router.post('/updateprofile/:id', async function (req, res) {
  let id = req.params.id
  let myquery = {_id:ObjectId(id)}
  let newvalues = { $set: {"about":req.body.about,"name":req.body.name}}
  db.get().collection('users').updateOne(myquery,newvalues)
  res.redirect('/users/myprofile')
});


module.exports = router;