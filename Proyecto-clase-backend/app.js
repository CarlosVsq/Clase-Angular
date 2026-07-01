require('dotenv').config();

var express = require('express');
var mysql = require('mysql');
var fileUpload = require('express-fileupload');
var bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');
let SEED = "esta-es-una-semilla-para-generar-un-token";
let SEED_RESET = "esta-es-una-semilla-para-recuperar-password";

const bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

app.use(cors());

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

conn.connect();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Express Server - Puerto ' + PORT + ' online');
});

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
    next();
});

app.post('/usuarios', (req, res) => {
    const { name, email, img, role } = req.body;
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const sql = `INSERT INTO usuarios (userName, userEmail, userPassword, userImg, userRole) VALUES (?, ?, ?, ?, ?)`;
    conn.query(sql, [name, email, hashedPassword, img, role], (err, result) => {
        if(err) throw err;
        res.status(201).json({
            ok:true,
            mensaje: 'Usuario registrado correctamente'
        });
    });
});

app.post('/login', (req, res) => {
    const { email } = req.body;
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const sql = 'SELECT * FROM usuarios WHERE userEmail = ?';
    conn.query(sql, [email], (err, results) => {
        if(err) throw err;
        if(results.length === 0){
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario No encontrado'
            });
        } else {
            const user = results[0];
            const passwordMatch = bcrypt.compareSync(req.body.password, user.userPassword);
            if(!passwordMatch) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Contraseña incorrecta'
                });
            }

            const token = jwt.sign({ usuario: user }, SEED, { expiresIn: 14400});
            res.status(200).json({
                ok:true,
                mensaje: 'login exitoso',
                usuario: user,
                token: token
            });
        }
    });
});

app.post('/google-login', async (req, res) => {
    const { token } = req.body;
    console.log('Token recibido: ' + token);
    try {
        const { name, email, picture } = await verifyGoogleToken(token);
        conn.query('SELECT * FROM usuarios WHERE userEmail = ?', [email], (err, results) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar la base de datos',
                    error: err
                });
            }
            if (results.length === 0) {
                console.log('Usuario no encontrado -> creando nuevo usuario');
                const datosUsuario = {
                    userName: name,
                    userEmail: email,
                    userImg: picture,
                    userPassword: bcrypt.hashSync(Math.random().toString(36).slice(2) + Date.now(), 10),
                    userRole: 'USER'
                };
                conn.query('INSERT INTO usuarios SET ?', datosUsuario, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear el usuario',
                            error: err
                        });
                    }
                    const nuevoUsuario = {
                        id: result.insertId,
                        userName: name,
                        userEmail: email,
                        userImg: picture,
                        userRole: 'USER'
                    };
                    const tokenApp = jwt.sign({ usuario: nuevoUsuario }, SEED, { expiresIn: 14400 });
                    return res.status(201).json({
                        ok: true,
                        mensaje: 'Usuario creado y login exitoso',
                        usuario: nuevoUsuario,
                        token: tokenApp
                    });
                });
            } else {
                console.log('Usuario encontrado');
                const user = results[0];
                const tokenApp = jwt.sign({ usuario: user }, SEED, { expiresIn: 14400 });
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Login exitoso',
                    usuario: user,
                    token: tokenApp
                });
            }
        });
    } catch (error) {
        res.status(401).json({
            ok: false,
            mensaje: 'Token no válido',
            error: error
        });
    }
});

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const EMAIL_CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const EMAIL_CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
const EMAIL_REDIRECT_URI = process.env.EMAIL_REDIRECT_URI;
const EMAIL_REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    EMAIL_CLIENT_ID,
    EMAIL_CLIENT_SECRET,
    EMAIL_REDIRECT_URI
);

oauth2Client.setCredentials(
    { refresh_token: EMAIL_REFRESH_TOKEN }
);
const accessToken = oauth2Client.getAccessToken();

const smptTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: EMAIL_CLIENT_ID,
        clientSecret: EMAIL_CLIENT_SECRET,
        refreshToken: EMAIL_REFRESH_TOKEN,
        accessToken: accessToken
    }
});

app.post('/email-test', (req, res) => {
    let msg = ` <h3>
                <span style="background-color: #ffcc00;">
                    Envío de Email con NodeJS - Nodemailer y GMail
                </span>
            </h3>
            <p>Este es un <strong> email de ejemplo </strong> utilizando
                <span style="color: #ff0000;">Nodemailer</span> y <em>NodeJS</em>.
            </p>
            <ul>
                <li>Permite formato HTML</li>
                <li>Permite adjuntar archivos</li>
                <li>Se utiliza una cuenta GMail configurada con OAuth2</li>
            </ul>`;

    const { email_adress } = req.body;

    const mailOptions = {
        from: "Asignatura Angular",
        to: email_adress,
        subject: "Email de ejemplo con Nodemailer",
        generateTextFromHTML: true,
        html: msg
    };

    smptTransport.sendMail(mailOptions, (err, response) => {
        if (err) {
            console.log(err)
            throw err;
        }
        console.log(response);
        smptTransport.close();
        res.status(200).json({
            ok: true,
            mensaje: 'Email enviado correctamente'
        });
    });
});

app.post('/recuperar-password', (req, res) => {
    const { email } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE userEmail = ?';
    conn.query(sql, [email], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario No encontrado'
            });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = bcrypt.hashSync(code, 10);
        const token = jwt.sign({ email, codeHash }, SEED_RESET, { expiresIn: 900 });

        let msg = ` <h3>
                    <span style="background-color: #ffcc00;">
                        Recuperación de contraseña
                    </span>
                </h3>
                <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                <p>Tu código de verificación es:</p>
                <h2 style="letter-spacing: 4px;">${code}</h2>
                <p>Este código expira en <strong>15 minutos</strong>. Si no solicitaste este cambio, ignora este correo.</p>`;

        const mailOptions = {
            from: "Asignatura Angular",
            to: email,
            subject: "Código de recuperación de contraseña",
            generateTextFromHTML: true,
            html: msg
        };

        smptTransport.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.log(err);
                throw err;
            }
            console.log(response);
            smptTransport.close();
            res.status(200).json({
                ok: true,
                mensaje: 'Código enviado al correo',
                token: token
            });
        });
    });
});

app.post('/reset-password', (req, res) => {
    const { token, code, password } = req.body;

    jwt.verify(token, SEED_RESET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Código expirado o inválido'
            });
        }

        if (!bcrypt.compareSync(code, decoded.codeHash)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Código incorrecto'
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const sql = 'UPDATE usuarios SET userPassword = ? WHERE userEmail = ?';
        conn.query(sql, [hashedPassword, decoded.email], (err, result) => {
            if (err) throw err;
            res.status(200).json({
                ok: true,
                mensaje: 'Contraseña actualizada correctamente'
            });
        });
    });
});

app.use(function(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no proporcionado'
        });
    } else {
        jwt.verify(token, SEED, (err, decoded) => {
            if(err){
                return res. status(401).json({
                    ok: false,
                    mensaje: 'Token no valido'
                });
            }
            req.usuario = decoded.usuario;
            next();
        })
    }
});

app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    conn.query(sql, (err, results) => {
        if (err) throw err;
        res.status(200).json({
            ok: true,
            productos: results
        });
    });
});

app.get('/productos/top-rating', (req, res) => {
    const sql = 'SELECT productName, starRating FROM productos ORDER BY starRating DESC LIMIT 5';
    conn.query(sql, (err, results) => {
        if (err) throw err;
        const productos = results.map(p => ({
            name: p.productName,
            value: p.starRating
        }));
        res.status(200).json({
            ok: true,
            productos: productos
        });
    });
});

app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

app.post('/productos', (req, res) => {
    const { name, code, date, price, description, rating, image } = req.body;
    const sql = `INSERT INTO productos
        (productName, productCode, releaseDate, price, description, starRating, imageURL)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    conn.query(sql, [name, code, date, parseInt(price), description, parseInt(rating), image], (err, result) => {
        if (err) throw err;
        res.status(200).json({
            ok: true,
            mensaje: 'Producto añadido correctamente'
        });
    })
});

app.get('/producto/:id', (req, res) => {
    const { id } = req.params.id;
    const sql = 'Select * FROM productos WHERE productId = ?';

    conn.query(sql, [id], (err, results) => {
        if (results.length === 0) {
            return res.status(404).send('Error, el id seleccionado no existe');
        }

        if (err) throw err;
        res.status(200).json({
            ok: true,
            producto: results
        });
    });
});

app.delete('/productos/:id', (req, res) => {
    const sql = 'DELETE FROM productos WHERE productId = ?';
    conn.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.status(200).json({
            ok: true,
            mensaje: 'Producto eliminado correctamente'
        });
    });
});

app.put('/productos/:id', (req, res) => {
    const { name, code, date, price, description, rate } = req.body;
    if (!name || !code || !date || !price || !description || !rate) {
        return res.status(400).send('No hay req body');
    }
    const sql = 'UPDATE productos SET productName = ?, productCode = ?, releaseDate = ?, price = ?, description = ?, starRating = ? WHERE productId = ?';
    conn.query(sql, [name, code, date, parseInt(price), description, parseInt(rate), req.params.id], (err, result) => {
        if (err) throw err;
        res.status(200).json({
            ok: true,
            mensaje: 'Producto actualizado correctamente'
        });
    });
});

app.put('/upload/productos/:id', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha seleccionado ningún archivo'
        });
    }

    const file = req.files.image;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];

    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de extensión no permitido'
        });
    }

    const productId = req.params.id;
    const fileName = `${productId}-${new Date().getMilliseconds()}.${fileExtension}`;
    const uploadPath = __dirname + '/upload/productos/' + fileName;

    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al subir el archivo',
                error: err
            });
        }

        const sql = 'UPDATE productos SET imageUrl = ? WHERE productId = ?';
        conn.query(sql, [uploadPath, productId], (err, result) => {
            if (err) throw err;
            res.status(200).json({
                ok: true,
                mensaje: 'Archivo subido y producto actualizado correctamente'
            });
        });
    });
});

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ||
    '336786427393-8vee6l6vmicqaovpu60qs6cefsslof4s.apps.googleusercontent.com';

async function verifyGoogleToken(token) {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload);
    return {
        name: payload.name,
        email: payload.email,
        picture: payload.picture
    };
}

