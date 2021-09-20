const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');
const { check, validationResult } = require('express-validator'); // form validation and other stuff

// @route api/auth
// @desc Test route
// @access Public

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password') //don't want to return the password
        res.json(user);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public

router.post('/', [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists()
], 
async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({errors: error.array()});
    }
    const {email, password} = req.body;
    
    try{

         let user = await User.findOne({email});
         if(!user){
             return res.status(400).json({errors: [{ msg: 'Invalid Credentials'}]});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({errors: [{ msg: 'Invalid Credentials'}]})
        }

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