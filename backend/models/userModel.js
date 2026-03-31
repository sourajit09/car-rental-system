import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    uname:{
        type:String,
        required:[true,'username is required']
    },
    email:{
        type:String,
        required:[true,`email is required`],
        unique:true
    },
    password:{
        type:String,
        required:[true,`password is required`]
    },
    phone:{
        type:String,
        required:[true,"phone is required"]
    },
    isAdmin:{
        type:Boolean,
        default:false
    }

},
{timestamps:true}
)

const userModel=mongoose.model("user",userSchema)

export default userModel
