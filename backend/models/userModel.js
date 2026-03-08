import mongoose from "mongoose";


const userSchema=new mongoose.Schema({
    uname:{
        type:String,
        require:[true,'username is requried']
    },
    email:{
        type:String,
        require:[true,`email is required`],
        unique:true
    },
    password:{
        type:String,
        require:[true,`password is required`]
    },
    phone:{
        type:String,
        require:[true,"phone is required"]
    },

},
{timestamps:true}
)

const userModel=mongoose.model("user",userSchema)

export default userModel