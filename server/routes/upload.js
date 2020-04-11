const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');


app.use( fileUpload({useTempFiles: true}));

app.put('/upload/:tipo/:id', function(req, res){

    let tipo = req.params.tipo;
    let id = req.params.id;

    if(!req.files){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    //Valida tipo
    let tiposValidos = ['productos', 'usuarios'];
    if(tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
            }
        });
    }

    let archivo = req.files.archivo;
    let nombreArchSplit = archivo.name.split('.');
    let extension = nombreArchSplit[nombreArchSplit.length - 1];

    //Extensiones permitidas
    let extensionesValidas =['png','gif', 'jpg', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0){

        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    //Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {

        if(!req.files){
            return res.status(400).json({
                ok: false,
                err 
            });
        }

        if(tipo === 'usuarios'){
            imagenUsuario(id, res, nombreArchivo);
        }
        else {
            imagenProducto(id, res, nombreArchivo);    
        }
    });

});


function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if(err){
            //Si hay un error, borra el archivo que ya se subio
            borrarArchivo(usuarioDB.img, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioDB){
            //Si hay un error, borra el archivo que ya se subio
            borrarArchivo(usuarioDB.img, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        //Si existe borra el archivo
        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });

}


function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if(err){
            //Si hay un error, borra el archivo que ya se subio
            borrarArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            //Si hay un error, borra el archivo que ya se subio
            borrarArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        //Si existe borra el archivo
        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });

}


function borrarArchivo(nombreImg, tipo){
    
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImg}`);
    if(fs.existsSync(pathImagen)){
        fs.unlinkSync(pathImagen);
    }
}



module.exports = app;