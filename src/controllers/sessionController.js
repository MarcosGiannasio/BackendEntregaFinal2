const { userService, contactService } = require("../service/services.js")
const { validPassword, creaHash } = require("../utils/bcryptHash.js")
const { generateToken } = require("../utils/jsonWebToken.js")

class SessionController {

    register = async (req,res) => {
        try {
            const {firtsName, lastName, userName, email, birthDate, password} = req.body
            
            if(firtsName == "" || lastName == "" || email == "" || 
            password == "" || userName == "" || birthDate == ""){
                throw({status: "error" ,message:"Fill in the missing fields"})
            }
            if(await userService.getUser({email})){
                throw({status:"Error", message:"This email is registered"})
            }

            if(await userService.getUser({userName})) {
                throw({status:"Error", message:"Username is not available"})
            }

            const user = await userService.createUser({firtsName, lastName, userName, email, birthDate, password: creaHash(password)})
            let Accesstoken = generateToken({ firtsName, lastName, email })
            res.status(201).send({
                status:"success", 
                message:`The user ${user.firtsName} ${user.lastName} registered successfully`, Accesstoken
            })   
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body
            const user = await userService.getUser({email})

            if(email === "" || password === "") throw({status:"error", message:"Fill in the missing fields"}) 

            if(!user) throw({status:"error", message:"Invalid email"})

            if(!validPassword(password, user)) throw({status:"error", password:"Invalid password"})
 
            if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
                user.role = "admin"
            }
            
            let Accesstoken = generateToken(user)
            req.user = user

            req.user.role
            ? res.status(200).cookie("CoderCookieToken", Accesstoken, { maxAge: 60 * 60 * 100, httpOnly: true }).redirect("/api/productos")
            : res.status(404).send({status:"Error"})

        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    }

    infoCurrent = async(req,res) => {
        const {email} = req.user
        const contact = await contactService.getContact({email})

        contact 
        ? res.status(200).send({status:"success", toInfo: contact}) 
        : res.status(404).send({status:"Error", message:"Your information does not exist"})
    }

    privada = async(req,res) => {
        res.send(`Podes ver los productos ${req.user.userName} `)
    }

    gitHub = async(req,res) => {}

    gitHubCall = async(req,res) => {
        let Accesstoken = generateToken(req.user)
        res.status(200).cookie("CoderCookieToken", Accesstoken,{maxAge: 60*60*100, httpOnly: true}).redirect("/api/productos")
    } 

    logout = async(req, res) => {
        res.clearCookie("CoderCookieToken").redirect("/login")
    }

}

module.exports = SessionController