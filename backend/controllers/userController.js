import userModel from "../models/userModel"
import bcrypt from "bcryptjs"

export const register=async(req,res)=>{
try{
const {uname,email,password,phone}=req.body

if(!uname | !email | !password | !phone){
    return res.status(400).send({
        success:false,
        message:`please provide all fields`
    })
}

const existinguser=await userModel.findOne({email})
if(existinguser){
    return res.status(500).send({
        success:false,
        message:`Use Already Exists`
    })
}
const salt=await bcrypt.genSalt(10)
const hashedPassword=await bcrypt.hash(password,salt)

const user=new userModel({uname,email,password:hashedPassword,phone})
await user.save()
user.password=undefined
res.status(201).send({
    success:true,
    message:`User Created!`,
    user
})
}catch(error){
    console.log(error)
    res.status(500).send({
        success:false,
        message:"Error in Register",
        error
    })
}
}