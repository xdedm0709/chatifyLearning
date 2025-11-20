import { ENV } from "../lib/env.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req,res,next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({message: "未经授权-未提供token"});
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded) {
            return res.status(401).json({message: "未经授权-无效token"});
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user) {
            return res.status(404).json({message: "用户未找到"});
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("错误: 保护路由中间件:", error);
        res.status(500).json({message:"内部服务器错误"});
    }
}