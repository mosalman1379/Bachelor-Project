const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const {
    insertOnUsers,
    ShowSalaries,
    checkValidity,
    insertSalary,
    insertProperty,
    upload,
    ShowProperties,
    insertOnOrder,
    getUser,
    updateProperties,
    showOrders,
    buy_order, Get_Wallet_by_person_id, last_year_salaries
} = require("./mongodb");
const bodyParser = require("body-parser");
const {getCookie, saveGeorgian} = require("./utilities");
const cors = require('cors');
const cookie_parser = require('cookie-parser');
const {create_nft} = require('./SmartContract/js/nft_storage');
const {add_ipfs} = require("./SmartContract/js/web3_train");
const {TransferFromTo, MintingToken} = require("./SmartContract/js/deploy_token_contract");

const app = express();
const port = process.env.PORT || 8080;

// middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(favicon(path.join(__dirname, "public/images/favicon.ico")));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/uploads")));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(cors());
app.use(cookie_parser());

// Constants
const Html_folder = path.join(__dirname, "public/html/");

app.get("/", (req, res) => {
    res.render(path.join(Html_folder, "index.ejs"), {is_registered: false});
});

app.post("/signup", async (req, res) => {
    const data = req.body;
    const wallet_address = data["wallet_address"];
    await insertOnUsers(data);
    res.setHeader("Set-Cookie", `wallet=${wallet_address}`);
    res.setHeader("Set-Cookie","type=people");
    res.render(path.join(Html_folder, "index.ejs"), {is_registered: true});
});

app.get('/show_orders/:wallet', async (req, res) => {
    const wallet_address = req.params.wallet;
    const result = await showOrders(wallet_address);
    res.json({'result': result});
})

app.post('/buy_order/', async (req, res) => {
    const body = req.body;
    await buy_order(body.data);
    res.redirect('/dashboard');
})

app.get("/login", (req, res) => {
    res.render(path.join(Html_folder, "login.ejs"), {isLogin: false});
});
app.get("/dashboard", (req, res) => {
    if (req.cookies.wallet === undefined) {
        res.redirect('login');
    } else {
        res.render(path.join(Html_folder, "dashboard.ejs"));
    }
});

app.post('/show_salary/:wallet_address', async (req, res) => {
    const result = await ShowSalaries(req.params.wallet_address);
    res.json({'documents': result});
})

app.post('/create_order', async (req, res) => {
    const orders = req.body;
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        await insertOnOrder(order);
    }
    res.redirect('/dashboard');
})

app.post('/show_property/:wallet_address', async (req, res) => {
    const result = await ShowProperties(req.params.wallet_address);
    res.json({'documents': result});
})

app.post("/register_property", upload.single("prop_file"), async (req, res) => {
    try {
        const property_file_path = req.file.path;
        const property_file_name = req.file.originalname;
        const {description, property_type, property_price} = req.body;
        const wallet_address = req.cookies.wallet;
        const result = await create_nft(wallet_address, property_type, description);
        const data = {
            description: description,
            property_file_name: property_file_name,
            property_file_path: property_file_path,
            property_type: property_type,
            property_price: parseInt(property_price),
            wallet_address: wallet_address,
            nft_hash: result.ipnft,
            address:getCookie("wallet")
        };
        await add_ipfs(data);
        await insertProperty(data);
        res.status(200).redirect('/dashboard');
    } catch (error) {
    }
});

app.post('/get_property_by_id', async (req, res) => {
    const {person_id} = req.body;
    const user = await Get_Wallet_by_person_id(person_id);
    const properties = await ShowProperties(user.wallet_address);
    const salaries = await last_year_salaries(user.wallet_address);
    res.json({'properties':properties,'salaries':salaries});
})

app.get('/get_user/:username', async (req, res) => {
    const username = req.params.username;
    const result = await getUser(username);
    res.json({'user': result})
})

app.post('/change_order', async (req, res) => {
    const body = req.body;
    await updateProperties(body.property_names, body.own_wallet, body.desired_wallet);
    res.redirect('/dashboard');
})

app.post("/register_salary", async (req, res) => {
    let {salary, date} = req.body;
    const wallet_address = getCookie(req, "wallet");
    date = saveGeorgian(date);
    const data = {
        wallet_address: wallet_address,
        salary_date: date,
        amount: salary,
    };
    await insertSalary(data);
    await MintingToken(wallet_address,data.amount);
    res.redirect("/dashboard");
});
app.post("/login", async (req, res) => {
    const {wallet_address,user_type} = await checkValidity(req.body);
    if (wallet_address !== undefined) {
        res.cookie("wallet", `${wallet_address}`);
        res.cookie("type", `${user_type}`);
        res.redirect('/dashboard');
    } else {
        res.redirect("/login");
    }
});
app.get('/logout',(req,res)=>{
    res.clearCookie("wallet");
    res.clearCookie("type");
    res.redirect('/dashboard');
})
app.listen(port, () => console.log(`Server is running on port ${port}`));
