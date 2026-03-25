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

// RUTA 1: Registro de nuevo usuario (CORREGIDA)
app.post('/api/registro', (req, res) => {
    // 1. Extraemos con los nombres que vienen de Angular
    const { carnet, nombres, apellidos, correo, pass } = req.body; 

    // 2. Query con los nombres de tus columnas en MySQL
    // Nota: Agregamos los nombres de las columnas antes de VALUES para evitar errores de orden
    const sql = 'INSERT INTO estudiante (registro_academico, nombres, apellidos, correo, contrasena) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [carnet, nombres, apellidos, correo, pass], (err, result) => {
        if (err) {
            console.error("❌ Error en MySQL:", err.message);
            // Si el error es por carnet duplicado
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ mensaje: "El carnet ya existe" });
            }
            return res.status(500).json({ mensaje: "Error en servidor", detalle: err.message });
        }
        console.log("✅ Usuario guardado con éxito");
        res.json({ mensaje: "Usuario registrado con éxito" });
    });
});

// RUTA: Verificar si el carnet y correo existen y coinciden
app.post('/api/validar-usuario', (req, res) => {
    const { carnet, correo } = req.body;
    
    console.log("Intentando validar:", { carnet, correo }); // Debug
    
    // Buscamos si existe un estudiante con ese carnet Y ese correo (case-insensitive)
    const sql = 'SELECT * FROM estudiante WHERE registro_academico = ? AND LOWER(correo) = LOWER(?)';

    db.query(sql, [carnet, correo], (err, results) => {
        if (err) {
            console.error("Error en BD:", err);
            return res.status(500).json({ mensaje: "Error de servidor" });
        }
        
        console.log("Resultados encontrados:", results.length); // Debug
        
        if (results.length > 0) {
            console.log("✅ Usuario validado:", results[0]); // Debug
            console.log('Enviando respuesta al cliente: { mensaje: "Usuario validado correctamente" }');
            res.status(200).json({ mensaje: "Usuario validado correctamente" });
            console.log('✅ Respuesta enviada al cliente');
        } else {
            console.log("❌ No se encontraron coincidencias"); // Debug
            res.status(404).json({ mensaje: "Datos incorrectos" });
        }
    });
});


// RUTA: Login (Verificar carnet y contraseña)
app.post('/api/login', (req, res) => {
    const { carnet, password } = req.body;
    const sql = 'SELECT * FROM estudiante WHERE registro_academico = ? AND contrasena = ?';
    
    db.query(sql, [carnet, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Error en DB" });
        if (results.length > 0) {
            res.json({ mensaje: "OK", usuario: results });
        } else {
            res.status(401).json({ mensaje: "Error" });
        }
    });
});

// RUTA DEBUG: Ver todos los usuarios registrados (para debuggear)
app.get('/api/debug/estudiantes', (req, res) => {
    const sql = 'SELECT registro_academico, nombres, apellidos, correo FROM estudiante';
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// RUTA 3: Recuperar/Cambiar Contraseña
app.post('/api/recuperar', (req, res) => {
    const { carnet, nuevaPass } = req.body;

    // Usamos el carnet como llave para actualizar la contraseña
    const sql = 'UPDATE estudiante SET contrasena = ? WHERE registro_academico = ?';

    db.query(sql, [nuevaPass, carnet], (err, result) => {
        if (err) return res.status(500).json({ mensaje: "Error en base de datos" });
        
        // Si result.affectedRows es 0, significa que el carnet no existe
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "El carnet no está registrado" });
        }
        
        res.json({ mensaje: "Contraseña actualizada exitosamente" });
    });
});