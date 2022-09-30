const express = require('express');
const aws = require('aws-sdk');
const app = express();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const upload = multer();

const config = new aws.Config({
    accessKeyId: 'AKIAQLAIYA5SIXYU5E4W',
    secretAccessKey: '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',
    region: 'ap-southeast-1',
});

aws.config = config;

const DB = new aws.DynamoDB.DocumentClient();

const TABLE_NAME = 'Bao';

app.use(express.static('./views'));
app.use(express.json({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './views');

let error = {};
let payload = {};
app.get('/', (req, res) => {
    const params = {
        TableName: TABLE_NAME,
    };

    DB.scan(params, (err, data) => {
        dsBaoTmp = data.Items;
        if (err) {
            console.log(err);

            throw new Error('Internal Server Error');
        } else return res.render('index', { dsBao: data.Items });
    });
});

app.get('/addBao', (req, res) => {
    error = {};
    payload = {
        ten_bao: '',
        ISBN: '',
        nam_sx: '',
        so_trang: '',
        ten_nhom_tg: '',
    };
    res.render('addBao', { error, payload });
});

app.post('/', upload.fields([]), (req, res) => {
    error = {};
    const ma_bao = uuidv4();
    let { ten_bao, ISBN, nam_sx, so_trang, ten_nhom_tg } = req.body;

    ten_bao = ten_bao.trim();
    ISBN = ISBN.trim();
    nam_sx = nam_sx.trim();
    ten_nhom_tg = ten_nhom_tg.trim();
    if (ten_bao.length === 0) error.ten_bao = 'ten bao khong duoc de trong';

    if (!ISBN.length === 0) error.ISBN = 'ISBN khong duoc de trong';
    if (!/^\d{3}-\d{3}-\d{3}$/.test(ISBN)) error.ISBN = "ISBN phai dung dinh dang '123-456-789'";

    if (!nam_sx) error.nam_sx = 'nam sx khong duoc de trong';

    if (!/^[1,2]\d{3}$/.test(nam_sx)) error.nam_sx = 'nam sx khong dung';

    if (!ten_nhom_tg) error.ten_nhom_tg = 'ten nhom tac gia khong duoc de trong';

    if (!ten_bao) error.ten_bao = 'ten bao khong duoc de trong';

    if (!so_trang || so_trang <= 0) error.so_trang = 'so trang > 0';

    if (!(Object.keys(error).length === 0 && error.constructor === Object)) {
        payload = {
            ten_bao: ten_bao ? ten_bao : '',
            ISBN: ISBN ? ISBN : '',
            nam_sx: nam_sx ? nam_sx : '',
            so_trang: so_trang ? so_trang : '',
            ten_nhom_tg: ten_nhom_tg ? ten_nhom_tg : '',
        };
        return res.render('addBao', { error, payload });
    }
    error = {};
    const params = {
        TableName: TABLE_NAME,
        Item: {
            ma_bao,
            ten_bao,
            ISBN,
            nam_sx,
            so_trang,
            ten_nhom_tg,
        },
    };
    DB.put(params, (err, data) => {
        if (err) {
            console.log(err);
            throw new Error('Internal Server Error');
        } else {
            return res.redirect('/');
        }
    });
});

app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);
    if (listItems.length === 0) return res.redirect('/');

    function onDelete(index) {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                ma_bao: String(listItems[index]),
            },
        };
        DB.delete(params, (err, data) => {
            if (err) {
                console.log(err);
                throw new Error('Internal Server Error');
            } else {
                if (index > 0) {
                    onDelete(index - 1);
                } else return res.redirect('/');
            }
        });
    }
    onDelete(listItems.length - 1);
});

const PORT = 4001;

app.listen(PORT, () => {
    console.log(`server is started on port ${PORT}`);
});
