import { Router } from "express";

const router = Router()

router.post('/identify', async (req, res) => {
    res.json({
        contact: {
            
        }
    })
})

export {
    router as identifyContactRouter
}