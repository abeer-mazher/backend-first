import express from "express";
import dotenv from "dotenv"
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt"
import User from "./models/user.model.js";
import jwt from "jsonwebtoken"
import verifyUser from "./middleware/userVerify.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors())
dotenv.config();


mongoose.connect(process.env.DB_URI)
.then(res =>{
    console.log("mongo db connected")
})
.catch(err =>{
    console.log(err)
})

app.get("/",(req,res)=>{
    res.json({
        status:true,
        msg:"server is running"
    })
})

app.post("/api/register",async (req,res)=>{
    const {username,email,phone,password} =req.body

    if(!username || !email || !phone || !password){
        return res.json({
            status:false,
            msg:"all fields are required"
        })
    }
    const checkUser = await User.findOne({email:email});

    if(checkUser !== null) {
        return res.json({
            status:false,
            msg:"This email is already exist"
        }) 
    }



    const hashpass = await bcrypt.hash(password,10);

    console.log(hashpass);

    const userObj = {
        username,
        email,
        phone,
        password:hashpass
    }

    const user = await User.create(userObj)


    return res.json({
        status:true,
        msg:"user successfully registered"
    }) 

})

app.post("/api/login",async (req,res)=>{
    try {
        const {email,password} =req.body

    if(!email ||  !password){
        return res.json({
            status:false,
            msg:"all fields are required"
        })
    }

    const user = await User.findOne({email:email});

    if(user == null) {
        return res.json({
            status:false,
            msg:"incorrect password or email"
        }) 
    }

    const comparePass = await bcrypt.compare(password , user.password);
    
    if(!comparePass) {
        return res.json({
            status:false,
            msg:"incorrect password or email"
        }) 
    }

    
    const token = jwt.sign({
    email:user.email,id:user._id,username:user.username
    },process.env.SECRET_KEY)


      return res.json({
            status:true,
            msg:"user successfully logged in",
            token
        }) 

    } catch (error) {
        console.log(error)
    }
    
})


app.get("/api/getAllusers",verifyUser, async (req,res)=>{
    const users = await User.find({})

    res.json({
        status:true,
        users:users
        })
})
app.listen(process.env.PORT ,()=>{
    console.log(`server is running on ${process.env.PORT}`)
}  )
