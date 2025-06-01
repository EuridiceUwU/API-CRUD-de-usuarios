import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import pkg, { Result } from 'pg';

const { Client } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;
const corsOption = {
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-type'
};

app.use(cors(corsOption));

app.use(express.json());

const client = new Client(
    {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    }
);

client.connect((err) => {
    if (err) {
        console.error('Error al conectar: ', err);
        process.exit(1);
    } else {
        console.log(('Si funciona'));
        }
});


//CONSULTAR TODOS LOS USUARIOS  
app.get('/usuarios',(req, res) => {
    client.query('SELECT * FROM USUARIOS', (err, result) => {
        if (err) {
            res.status(500).json({mensaje: 'Error al consultar los usuarios.',error: err.message})
        } else {
            res.json(result.rows);
        }
    });
});

//AGREGAR USUARIO 
app.post('/usuarios',(req, res) => {
    const {nombre, correo, contrasena} = req.body;
    client.query( 'INSERT INTO USUARIOS (nombre, correo, contrasena) VALUES ($1, $2, $3)',
        [nombre, correo, contrasena],
        (err, result) => {
        if (err) {
            res.status(500).json({mensaje: 'Error al registrar usuario.',error: err.message})
        } else {
            res.json({mensaje: 'Usuario registrado correctamente.'});
        }
    });
});

//ACTUALIZAR USUARIOS
app.put('/usuarios/:id', (req, res) => {
    const {id} = req.params;
    const {nombre, correo, contrasena} = req.body;
    client.query( 'UPDATE USUARIOS SET nombre = $1, correo = $2, contrasena = $3 WHERE id = $4',
        [nombre, correo, contrasena, id],
        (err, result) => {
        if (err) {
            res.status(500).json({mensaje: 'Error al actualizar usuario.',error: err.message});
        } else {
            res.json({mensaje: 'Usuario actualizado correctamente.'});
        }
    });

});


//ELIMINAR USUARIO
app.delete('/usuarios/:id', (req, res) => {
    const {id} = req.params;
    client.query( 'DELETE FROM USUARIOS WHERE id = $1', [id], (err, result) => {
        if (err) {
            res.status(500).json({mensaje: 'Error al eliminar usuario.',error: err.message});
        } else {
            res.json({mensaje: 'Usuario eliminado correctamente.'});
        }
    });

});

//BUSCAR POR ID
app.get('/usuarios/:id', (req, res) => {
    const {id} = req.params;
    client.query( 'SELECT * FROM USUARIOS WHERE id = $1', [id], (err, result) => {
        if (err) {
            res.status(500).json({mensaje: 'Error al buscar usuario.',error: err.message});
        } else if (result.rows.length === 0 ) {
            return res.status(404).json({message: 'Usuario no encontrado.'});
        } else {
            return res.json(result.rows[0]);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
