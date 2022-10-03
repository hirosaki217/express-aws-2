const express = require('express')
const multer = require('multer')
const AWS = require('aws-sdk')

const app = express()
app.use(express.json({ 'extended': false }))
app.use(express.static('./views'))
app.set("view engine", "ejs")
app.set("views", "./views")

const config = new AWS.Config({
    accessKeyId: "",
    secretAccessKey: "",
    region: "ap-southeast-1"
})

const upload = multer()

AWS.config = config;

const DB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "SinhVien"

app.get("/", (req, res) => {
    const params = {
        TableName: TABLE_NAME,

    }

    DB.scan(params, (err, data) => {
        if (err)
            throw new Error("lol")
        else
            return res.render("index", { abs: data.Items })
    })

})

app.get("/add", (req, res) => {

    return res.render("addForm")


})


app.post("/", upload.fields([]), (req, res) => {
    const { ten, lop } = req.body;
    const ma = Date.now().toString()
    const params = {
        TableName: TABLE_NAME,
        Item: {
            ma,
            ten,
            lop
        }
    }

    DB.put(params, (err, data) => {
        if (err) {
            console.log(err);
            throw new Error("sadasdsa");
        } else
            return res.redirect("/")
    })
})


app.post("/delete", upload.fields([]), (req, res) => {
    const listKey = Object.keys(req.body);

    function onDelete(index) {

        const params = {
            TableName: TABLE_NAME,
            Key: {
                ma: listKey[index]
            }
        }

        DB.delete(params, (err, data) => {
            if (err) {
                console.log(err);
                throw new Error("sadasdsa");
            } else {
                if (index > 0)
                    onDelete(index - 1)
                return res.redirect("/")
            }
        })
    }

    onDelete(listKey.length - 1)
})




app.listen(4000, (err) => {
    console.log(`server is started on port 4000`);
})