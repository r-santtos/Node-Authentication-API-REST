const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://****:****@omnistack-oh3nu.mongodb.net/semana09?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

module.exports = mongoose;
