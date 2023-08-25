const {MongoClient} = require("mongodb");
const {default: mongoose} = require("mongoose");
const {User, Salary, Property, Order} = require("./schemas");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the directory where you want to store the uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Generate a unique filename for each uploaded file
    },
});
const Upload = multer({storage: storage});
require("dotenv").config();

async function insertOnUsers(data) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {dbName: dbName});
        data['user_type'] = "people";
        const newUser = new User(data);
        await newUser.save();
        console.log("user inserted successfully");
        await client.disconnect();
        return true;
    } catch (e) {
        console.log("Error occurred when insert document to user collection");
        return false;
    }
}

async function checkValidity(data) {
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;

    // Database Name
    const dbName = process.env.DB_NAME;

    try {
        // Connect to the server
        const client = await mongoose.connect(url, {dbName: dbName});
        const document = await User.findOne(data);
        await client.disconnect();
        if (document !== null) {
            return document._doc;
        } else {
        }
    } catch (err) {
        console.error("Error connecting to the database", err);
        return false;
    }
}

async function deleteOrders(property_names, wallet_Address) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {
            dbName: dbName
        });
        for (let i = 0; i < property_names.length; i++) {
            const property_name = property_names[i];
            await Order.findOneAndDelete({
                description: property_name,
                wallet_address: wallet_Address
            });
        }
        return true;
    } catch (e) {
        console.log("Error occurred when update documents form property collection");
        return false;
    }
}

async function insertOnSalary(data) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {dbName: dbName});
        const newSalary = new Salary(data);
        await newSalary.save();
        console.log("salary inserted successfully");
        await client.disconnect();
        return true;
    } catch (e) {
        console.log("Error occurred when insert document to salary collection");
        return false;
    }
}

async function insertOnProperty(data) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {dbName: dbName});
        const newProperty = new Property(data);
        await newProperty.save();
        console.log("property inserted successfully");
        await client.disconnect();
        return true;
    } catch (e) {
        console.log("Error occurred when insert document to property collection");
        return false;
    }
}

async function getUser(username) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {dbName: dbName});
        return await User.findOne({username: username});
    } catch (e) {
        console.log("Error occurred when fetch user from User collection");
        return false;
    }
}

async function insertOnOrder(data) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {dbName: dbName});
        const newOrder = new Order(data);
        await newOrder.save();
        console.log("order inserted successfully");
        await client.disconnect();
        return true;
    } catch (e) {
        console.log("Error occurred when insert document to order collection");
        return false;
    }
}


async function showProperties(wallet_address) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {
            dbName: dbName
        });
        return await Property.find({wallet_address: wallet_address});
    } catch (e) {
        console.log("Error occurred when retrieve documents form salary collection");
        return false;
    }
}

async function showSalaries(wallet_address) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {
            dbName: dbName
        });
        return await Salary.find({wallet_address: wallet_address});
    } catch (e) {
        console.log("Error occurred when retrieve documents form salary collection");
        return false;
    }
}

async function updateProperties(properties, wallet_address1, wallet_address2) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {
            dbName: dbName
        });
        for (let i = 0; i < properties.length; i++) {
            const property_name = properties[i];
            await Property.findOneAndUpdate({
                description: property_name,
                wallet_address: wallet_address1
            }, {wallet_address: wallet_address2});
        }
        return true;
    } catch (e) {
        console.log("Error occurred when update documents form property collection");
        return false;
    }
}

async function BuyOrder(properties) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {
            dbName: dbName
        });
        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            await Property.findOneAndUpdate({
                description: property.description,
                wallet_address: property.from
            }, {wallet_address: property.to});
        }
        return true;
    } catch (e) {
        console.log("Error occurred when update documents form property collection");
        return false;
    }
}

async function showOrders(wallet_address) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {
            dbName: dbName
        });
        return await Order.find({wallet_address: {$ne: wallet_address}});
    } catch (e) {
        console.log("Error occurred when retrieve documents form order collection");
        return false;
    }
}

async function get_wallet_by_person_id(person_id) {
    person_id = Number(person_id);
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {
            dbName: dbName
        });
        return await User.findOne({person_id: person_id});
    } catch (e) {
        console.log("Error occurred when retrieve documents form user collection");
        return false;
    }
}

async function last_year_salaries(wallet_address) {
    const dbName = process.env.DB_NAME;
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017`;
    try {
        const client = await mongoose.connect(url, {
            dbName: dbName
        });
        return await Salary.find({wallet_address: wallet_address}).sort({salary_date: -1}).limit(12);
    } catch (e) {
        console.log("Error occurred when retrieve documents form salary collection");
        return false;
    }
}

module.exports.ShowSalaries = showSalaries;
module.exports.upload_file = Upload;
module.exports.insertProperty = insertOnProperty;
module.exports.insertOnUsers = insertOnUsers;
module.exports.checkValidity = checkValidity;
module.exports.insertSalary = insertOnSalary;
module.exports.ShowProperties = showProperties;
module.exports.insertOnOrder = insertOnOrder;
module.exports.getUser = getUser;
module.exports.updateProperties = updateProperties;
module.exports.showOrders = showOrders;
module.exports.buy_order = BuyOrder;
module.exports.Get_Wallet_by_person_id = get_wallet_by_person_id;
module.exports.last_year_salaries = last_year_salaries;
module.exports.deleteOrders = deleteOrders;