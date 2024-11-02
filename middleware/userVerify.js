import jwt from "jsonwebtoken"

const verifyUser = (req,res,next)=>{
    try {
        
        const token = req.headers.authorization.split(" ")[1]
    
        const decode = jwt.verify(token,process.env.SECRET_KEY)
    
        if(!decode){
            return res.json({
                msg:"invalid token"
            })
        }
    
        return next();
    } catch (error) {
        res.json({
            msg:"invalid token"
        })
    }

}

export default verifyUser