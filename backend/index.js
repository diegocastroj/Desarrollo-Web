const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Configuraciones básicas
app.use(cors()); // Permite que Angular se comunique con este servidor
app.use(express.json()); // Permite leer datos en formato JSON

// Configuración de tu base de datos (La conexión)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'asdf', // <-- ¡Cambia esto por tu contraseña de ayer!
    database: 'evaluador_usac',
    port: 3306
});

// Intentar conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('¡Conectado exitosamente a la bodega de datos MySQL!');
});

// Una ruta de prueba para ver si el servidor responde
app.get('/', (req, res) => {
    res.send('¡Hola! El servidor backend está vivo y esperando órdenes.');
});

// Ruta para pedir todos los cursos del pensum
app.get('/api/cursos', (req, res) => {
    // Aquí escribimos el mismo comando SQL que usaste ayer en Workbench
    const comandoSQL = 'SELECT * FROM curso';
    
    db.query(comandoSQL, (err, resultados) => {
        if (err) {
            console.error('Error al buscar los cursos:', err);
            res.status(500).send('Hubo un error en la base de datos');
            return;
        }
        // Si todo sale bien, enviamos los resultados en formato JSON
        res.json(resultados); 
    });
});


// Ruta para pedir todos los ingenieros/catedráticos
app.get('/api/catedraticos', (req, res) => {
    // El comando SQL para traer la tabla de los maestros
    const comandoSQL = 'SELECT * FROM catedratico';
    
    db.query(comandoSQL, (err, resultados) => {
        if (err) {
            console.error('Error al buscar los catedráticos:', err);
            res.status(500).send('Hubo un error en la base de datos');
            return;
        }
        // Enviamos la lista completa en formato JSON
        res.json(resultados); 
    });
});

// Encender el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor del mesero corriendo en http://localhost:${PORT}`);
});

// RUTA 1: Registro de nuevo usuario
app.post('/api/registro', (req, res) => {
    const { registro_academico, nombres, apellidos, correo, contrasena } = req.body;
    const sql = 'INSERT INTO estudiante VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [registro_academico, nombres, apellidos, correo, contrasena], (err, result) => {
        if (err) return res.status(500).json({ mensaje: "Error al registrar. ¿Quizás el carnet ya existe?" });
        res.json({ mensaje: "Usuario registrado con éxito" });
    });
});

// RUTA 2: Login (Verificación)
app.post('/api/login', (req, res) => {
    const { carnet, password } = req.body;
    const sql = 'SELECT * FROM estudiante WHERE registro_academico = ? AND contrasena = ?';
    db.query(sql, [carnet, password], (err, results) => {
        if (err) return res.status(500).send("Error en servidor");
        if (results.length > 0) {
            res.json({ mensaje: "Acceso concedido", usuario: results });
        } else {
            res.status(401).json({ mensaje: "Datos incorrectos" });
        }
    });
});