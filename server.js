const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

//CONNECT DATABASE
connectDB();

const port = process.env.PORT || 5000;

// Init MiddleWare <= this can be used instead of body parser (comes with express)
app.use(express.json({extended: true}));


app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static assets in production
if(process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.listen(port, () => console.log(`Server started on port ${port}`));