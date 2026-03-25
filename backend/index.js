const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Configuraciones básicas
app.use(cors()); // Permite que Angular se comunique con este servidor
app.use(express.json()); // Permite leer datos en formato JSON

// Configuración la base de datos (La conexión)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'asdf',
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


app.get('/api/cursos', (req, res) => {
    
    const comandoSQL = 'SELECT * FROM curso'; // comando obitiene cursos
    
    db.query(comandoSQL, (err, resultados) => {
        if (err) {
            res.status(500).send('Hubo un error en la base de datos');
            return;
        }
        res.json(resultados); // los resutados se envian en formato JSON a Angular para que los pueda usar
    });
});



app.get('/api/catedraticos', (req, res) => {

    const comandoSQL = 'SELECT * FROM catedratico'; //obtiene catedraticos
    
    db.query(comandoSQL, (err, resultados) => {
        if (err) {
            res.status(500).send('Hubo un error en la base de datos');
            return;
        }
        res.json(resultados); // en JASON a angular
    });
});

// Encender el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor del mesero corriendo en http://localhost:${PORT}`);
});


app.post('/api/registro', (req, res) => {
    // 1. Extraemos con los nombres que vienen de Angular
    const { carnet, nombres, apellidos, correo, pass } = req.body; 

    // 2. Query con los nombres de tus columnas en MySQL
    const sql = 'INSERT INTO estudiante (registro_academico, nombres, apellidos, correo, contrasena) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [carnet, nombres, apellidos, correo, pass], (err, result) => {
        if (err) {
            // si el canet ya existe
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ mensaje: "El carnet ya existe" });
            }
            return res.status(500).json({ mensaje: "Error en servidor", detalle: err.message });
        }
        res.json({ mensaje: "Usuario registrado con éxito" });
    });
});


app.post('/api/validar-usuario', (req, res) => {
    const { carnet, correo } = req.body;
    
    // Buscamos si existe un estudiante con ese carnet Y ese correo
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


app.get('/api/debug/estudiantes', (req, res) => {
    const sql = 'SELECT registro_academico, nombres, apellidos, correo FROM estudiante';
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

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


    const sql = `INSERT INTO publicacion (registro_academico, id_curso, id_catedratico, mensaje) 
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [registro_academico, id_curso, id_catedratico, mensaje], (err, result) => {
        if (err) {
            return res.status(500).json({ mensaje: "Error al crear publicación" });
        }
        res.json({ mensaje: "Publicación creada con éxito", id: result.insertId });
    });
});


app.get('/api/cursos', (req, res) => {
    db.query('SELECT id_curso, nombre_curso FROM curso', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});


app.get('/api/catedraticos', (req, res) => {

    db.query('SELECT id_catedratico, nombres_catedratico FROM catedratico', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});


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
    
    db.query(sql, (err, results) => {
        if (err) {

            return res.status(500).json({ error: err.message, code: err.code });
        }
        
        
        res.json(results);
    });

        // Guardar un comentario
    app.post('/api/comentarios', (req, res) => {
        const { id_publicacion, registro_academico, texto_comentario } = req.body;
        const sql = `INSERT INTO comentario (id_publicacion, registro_academico, texto_comentario) VALUES (?, ?, ?)`;
        db.query(sql, [id_publicacion, registro_academico, texto_comentario], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: "Comentario guardado" });
        });
    });

    // Traer comentarios de una publicación
    app.get('/api/comentarios/:id', (req, res) => {
        const sql = `
            SELECT c.texto_comentario, e.nombres, e.apellidos 
            FROM comentario c 
            JOIN estudiante e ON c.registro_academico = e.registro_academico 
            WHERE c.id_publicacion = ? 
            ORDER BY c.fecha_comentario ASC`;
        db.query(sql, [req.params.id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    });

    // Obtener usuario por carnet
    app.get('/api/usuario/:carnet', (req, res) => {
        const sql = 'SELECT registro_academico, nombres, apellidos, correo FROM estudiante WHERE registro_academico = ?';
        db.query(sql, [req.params.carnet], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    });

    // Actualizar datos del usuario
    app.put('/api/usuario/actualizar', (req, res) => {
        const { registro_academico, nombres, apellidos, correo } = req.body;
        const sql = 'UPDATE estudiante SET nombres = ?, apellidos = ?, correo = ? WHERE registro_academico = ?';
        db.query(sql, [nombres, apellidos, correo, registro_academico], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json({ mensaje: 'Perfil actualizado exitosamente' });
        });
    });

    // Obtener cursos aprobados de un usuario
    app.get('/api/cursos-aprobados/:registro_academico', (req, res) => {
        const sql = `
            SELECT c.codigo_curso, c.nombre_curso, c.creditos
            FROM curso c
            INNER JOIN estudiante_curso_aprobado eca ON c.codigo_curso = eca.codigo_curso
            WHERE eca.registro_academico = ?
        `;
        db.query(sql, [req.params.registro_academico], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    });

    // Agregar un curso aprobado
    app.post('/api/cursos-aprobados', (req, res) => {
        const { registro_academico, codigo_curso } = req.body;

        // Verificar que el curso no esté ya aprobado
        const checkSql = 'SELECT * FROM estudiante_curso_aprobado WHERE registro_academico = ? AND codigo_curso = ?';
        db.query(checkSql, [registro_academico, codigo_curso], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Este curso ya está aprobado' });
            }

            // Insertar el curso aprobado
            const insertSql = 'INSERT INTO estudiante_curso_aprobado (registro_academico, codigo_curso) VALUES (?, ?)';
            db.query(insertSql, [registro_academico, codigo_curso], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ mensaje: 'Curso aprobado agregado exitosamente', id: result.insertId });
            });
        });
    });

    // Eliminar un curso aprobado
    app.post('/api/cursos-aprobados/eliminar', (req, res) => {
        const { registro_academico, codigo_curso } = req.body;
        const sql = 'DELETE FROM estudiante_curso_aprobado WHERE registro_academico = ? AND codigo_curso = ?';
        db.query(sql, [registro_academico, codigo_curso], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Curso no encontrado en aprobados' });
            }
            res.json({ mensaje: 'Curso aprobado eliminado exitosamente' });
        });
    });
});