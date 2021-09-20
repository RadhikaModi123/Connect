const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');
const { check, validationResult } = require('express-validator'); // form validation and other stuff

const User = require('../../models/User');


// @route POST api/users
// @desc Test route
//@ access Public

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Enter a password with 6 or more characters').isLength({min: 6})
], 
async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({errors: error.array()});
    }
    const {name, email, password} = req.body;
    
    try{

         let user = await User.findOne({email});
         if(user){
             return res.status(400).json({errors: [{ msg: 'User already exists'}]})
        }

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })


        user = new User({
            name,
            email,
            avatar,
            password
        })

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
            user: {
                id: user._id
            }
        };

        jwt.sign(
            payload,
            config.jwtSecret,
            {expiresIn: 36000},
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
        )

    } catch(error){
        console.log(error.message);
        return res.status(500).send('Server error');
    }
});

module.exports = router;