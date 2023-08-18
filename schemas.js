const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    person_id: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    wallet_address: {
        type: String,
        required: true
    },
    user_type:{
        type: String,
        required: true,
        default: "people"
    }
});
const SalarySchema = new mongoose.Schema({
    wallet_address: {
        type: String,
        required: true
    },
    salary_date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})

const propertySchema = new mongoose.Schema({
    description: {
        type: String,
        required: false
    },
    property_type: {
        type: String,
        required: true
    },
    property_price: {
        type: Number,
        required: true
    },
    property_file_name: {
        type: String,
        required: true
    },
    property_file_path: {
        type: String,
        required: true
    },
    nft_hash: {
        type: String,
        required: true
    },
    wallet_address: {
        type: String,
        required: true
    }
})
const OrderPropertySchema = new mongoose.Schema({
    description: {
        type: String,
        required: false
    },
    property_type: {
        type: String,
        required: true
    },
    property_price: {
        type: Number,
        required: true
    },
    property_file_path: {
        type: String,
        required: true
    },
    wallet_address: {
        type: String,
        required: true
    },
    order_date: {
        type: Date,
        required: true
    }
})


const OrderSchema = mongoose.model('order', OrderPropertySchema);
const PropertySchema = mongoose.model('property', propertySchema);
const User = mongoose.model('User', UserSchema);
const Salary = mongoose.model('Salary', SalarySchema);

module.exports.User = User;
module.exports.Salary = Salary;
module.exports.Property = PropertySchema;
module.exports.Order = OrderSchema;