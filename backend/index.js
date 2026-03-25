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
            // Si el error es por carnet duplicado
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ mensaje: "El carnet ya existe" });
            }
            return res.status(500).json({ mensaje: "Error en servidor", detalle: err.message });
        }
        res.json({ mensaje: "Usuario registrado con éxito" });
    });
});

// RUTA: Verificar si el carnet y correo existen y coinciden
app.post('/api/validar-usuario', (req, res) => {
    const { carnet, correo } = req.body;
    
    // Buscamos si existe un estudiante con ese carnet Y ese correo (case-insensitive)
    const sql = 'SELECT * FROM estudiante WHERE registro_academico = ? AND LOWER(correo) = LOWER(?)';

    db.query(sql, [carnet, correo], (err, results) => {
        if (err) {
            return res.status(500).json({ mensaje: "Error de servidor" });
        }
        
        if (results.length > 0) {
            res.status(200).json({ mensaje: "Usuario validado correctamente" });
        } else {
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
            res.json({ mensaje: "OK", usuario: results[0] });
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

// RUTA: Guardar una nueva publicación
app.post('/api/publicaciones', (req, res) => {
    const { registro_academico, id_curso, id_catedratico, mensaje } = req.body;

    console.log('📥 BACKEND - Datos recibidos:', { registro_academico, id_curso, id_catedratico, mensaje });
    console.log('📥 BACKEND - req.body completo:', req.body);

    const sql = `INSERT INTO publicacion (registro_academico, id_curso, id_catedratico, mensaje) 
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [registro_academico, id_curso, id_catedratico, mensaje], (err, result) => {
        if (err) {
            return res.status(500).json({ mensaje: "Error al crear publicación" });
        }
        res.json({ mensaje: "Publicación creada con éxito", id: result.insertId });
    });
});

// 1. Obtener Cursos
app.get('/api/cursos', (req, res) => {
    db.query('SELECT id_curso, nombre_curso FROM curso', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 2. Obtener Catedráticos
// Ruta corregida a singular
app.get('/api/catedraticos', (req, res) => {
    // Usamos 'catedratico' sin la 's'
    db.query('SELECT id_catedratico, nombres_catedratico FROM catedratico', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// 3. Obtener Publicaciones (El Query "Maestro")
app.get('/api/publicaciones', (req, res) => {
    const sql = `
        SELECT 
            p.id_publicacion, 
            p.mensaje, 
            p.fecha_creacion,
            p.registro_academico,
            p.id_curso,
            p.id_catedratico,
            e.nombres, 
            e.apellidos,
            c.nombre_curso AS nombre_curso,
            cat.nombre_catedratico AS nombre_catedratico
        FROM publicacion p
        JOIN estudiante e ON p.registro_academico = e.registro_academico
        LEFT JOIN curso c ON p.id_curso = c.codigo_curso
        LEFT JOIN catedratico cat ON p.id_catedratico = cat.id_catedratico
        ORDER BY p.fecha_creacion DESC`;

    console.log('📥 GET /api/publicaciones - ejecutando query...');
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error en GET /api/publicaciones:', err.message);
            console.error('❌ Código del error:', err.code);
            console.error('📋 SQL que falló:', sql);
            return res.status(500).json({ error: err.message, code: err.code });
        }
        
        console.log('✅ Publicaciones encontradas:', results.length);
        if (results.length > 0) {
            console.log('📋 Primer resultado:', results[0]);
        }
        
        res.json(results);
    });
});