const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/miniProject')

const userSchema = mongoose.Schema({
    username:String,
    name:String,
    age:String,
    email:String,
    password:String,
    profilepic:{
        type:String,
        default:"default_User_Img.avif"
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId, ref:"post"
    }]
})

module.exports = mongoose.model('user', userSchema);
