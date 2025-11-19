import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";

export const signup = async (req,res) => {
    const {fullName, email, password} = req.body;
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message:"所有空必须都填上"});
        }

        if(password.length < 6){
            return res.status(400).json({message:"密码长度至少为6位"});
        }

        //检查Email是否正确：正则表达式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message:"邮箱地址无效"});
        }

        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message:"邮箱已存在"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password:hashPassword
        });

        if(newUser){
            // generateToken(newUser._id, res);
            // await newUser.save();

            const saveUser = await newUser.save();
            generateToken(saveUser._id, res);

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });

            try {
                await sendWelcomeEmail(saveUser.email, saveUser.fullName, ENV.CLIENT_URL);
            } catch (error) {
                console.error("Fail to send welcome email:", error);
            }
        } else {
            res.status(400).json({message:"用户数据无效"});
        }

    } catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({message:"内部服务器错误"});
    }
}