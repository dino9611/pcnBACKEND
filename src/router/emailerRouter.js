import {
    sendEmail,
    publicAuth
} from '../helper'
import express from 'express'

let router = express.Router()

// router.use(publicAuth)

router.post('/', (req,res) => {
    sendEmail(
        'tmangowal@gmail.com',
        'Contact Our Team',
        `Email : ${req.body.email}
        Name : ${req.body.name}
        Number : ${req.body.number}
        
        ${req.body.text}`
    )
    
})

export const EmailerRouter = router