const express = require('express');
let { verificaToken, verificaAdminRol } = require('../middlewares/autentication');
let app = express();
let Categoria = require('../models/categoria');


//Show categorias
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
            .sort('descripcion')
            .populate('usuario', 'nombre email')
            .exec((err, categorias) => {
                
                if(err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    categorias
                });

            });
});


//Shoe categoria by Id
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    
    Categoria.findById(id, (err, categoriaDB) => {

        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        
        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});


//Create new categoria
app.post('/categoria', verificaToken, (req, res) => {

        let body = req.body;

        let categoria = new Categoria({
            descripcion: body.descripcion,
            usuario: req.usuario._id
        });

        categoria.save((err, categoriaDB) => {

            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if(!categoriaDB){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB
            });
        });
});


//Update categoria
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descCategoria ={
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, {new: true, runValidators: true}, (err, categoriaDB) => {

        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});


//Delete categorias
app.delete('/categoria/:id', [verificaToken, verificaAdminRol], (req, res) => {

        let id = req.params.id;
        
        Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
    
            if(!categoriaDB){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El id no existe'
                    }
                });
            }

            res.json({
                ok: true,
                message: 'Categoria borrada'
            });
        });
});



module.exports = app;