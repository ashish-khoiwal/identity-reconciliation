import { Router } from "express";
import { identifyContactService } from "../utils";

const router = Router()

router.post('/identify', async (req, res) => {
    const contact = await identifyContactService(req.body)
    res.json({
        contact
    })
})

export {
    router as identifyContactRouter
}