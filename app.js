const express = require('express');
const path = require('path')
const userModel = require('./model/user')
const userPost = require('./model/post')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const app = express()

app.set('view engine','ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req, res)=>{
    res.render("index") 
})

app.get('/login',(req, res)=>{
    res.render("login") 
})

app.get('/profile', isLogedin, async(req, res)=>{
   let user = await userModel.findOne({email: req.user.email}).populate("posts"); 
   console.log(user.posts)
  res.render("profile", {user}); 
})
app.get('/edit/:id', isLogedin, async(req, res)=>{
    let post = await userPost.findOne({_id: req.params.id}).populate("user"); 
   res.render("edit",{post}); 
 })

 app.post('/update/:id', isLogedin, async(req, res)=>{
    let post = await userPost.findOneAndUpdate({_id: req.params.id}, {content:req.body.content}); 
    console.log(post, "post1")
   res.redirect("/profile"); 
 })


app.get('/like/:id', isLogedin, async(req, res)=>{
    let post = await userPost.findOne({_id: req.params.id}).populate("user"); 
    console.log(post, "post")
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid)
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    }
    await post.save() 
   res.redirect("/profile"); 
 })

app.post('/post', isLogedin, async(req, res)=>{
    let user = await userModel.findOne({email: req.user.email})
    let {content} = req.body
    let post = await userPost.create({
        user:user._id,
        content
    });
    user.posts.push(post._id)
    await user.save()
   res.redirect("/profile"); 
 })

app.get('/logout',(req, res)=>{
    res.cookie('token',"")
    res.redirect('/login')
})

app.post('/register', async(req, res)=>{

    let {email, password, username, name, age} = req.body;

    let user = await userModel.findOne({email});
    if(user) return res.status(500).send("user already registred");

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{
            let user = await userModel.create({
                username,
                email,
                age,
                name,
                password:hash
            });

      let token = jwt.sign({email:email, userid:user._id}, "Anshu");
      res.cookie('token', token);
      res.send('Regisred') 
        })
    })
    
})
 

app.post('/login', async(req, res)=>{
    let {email, password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("user does not exits");

    bcrypt.compare(password, user.password, (err, result)=>{
        if(result){
            let token = jwt.sign({email:email, userid:user._id}, "Anshu");
            res.cookie('token', token);
            res.status(200).redirect("/profile")
        }
        else res.redirect('/login')
    })
    
})

function isLogedin(req, res, next){
    if (req.cookies.token === "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token, "Anshu");
        console.log(data)
        req.user = data;
    }

    next();

}


app.listen(3000) 