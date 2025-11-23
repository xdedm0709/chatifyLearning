import aj from "../lib/arcjet.js"
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ message: "请求繁忙，请稍后再试" });
            }
            else if (decision.reason.isBot()) {
                return res.status(403).json({ message: "拒绝机器人访问" });
            } else {
                return res.status(403).json({ message: "拒绝访问" });
            }
        }

        // 检查像真人的机器人
        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({
                error: "Spoofed bot detected",
                message: "Malicious bot activity detected.",
            });
        }

        next();
        
    } catch (error) {
        console.log("ArcjectProtection Error:", error);
        next();
    }
}