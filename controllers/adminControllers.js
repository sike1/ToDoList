const Usuarios = require("../models/Usuarios");
const Tareas = require("../models/Tareas");
const moment = require("moment")
const  Sequelize = require("sequelize")
const Op = Sequelize.Op;




exports.administracion =async (req,res)=>{
    const consultas = []

    consultas.push(Tareas.findAll({where:{usuarioId:req.usuario.id,
        fecha:{[Op.gte]: moment(new Date()).format("YYYY-MM-DD")}, 
        
       }, order:[["fecha","ASC"],["hora","ASC"]]}))

    consultas.push(Tareas.findAll({where:{usuarioId:req.usuario.id,
                                   fecha:{[Op.lt]: moment(new Date()).format("YYYY-MM-DD")}, 
                                     },                        
                                     order:[["fecha","ASC"],["hora","ASC"]]}))
   

   const [tareas,tareasAn] = await Promise.all(consultas)

    res.render("administracion",{
        pagina: "Panel de Administración",
        tareas,
        moment,
        csrfToken: req.csrfToken(),
        tareasAn,
        usuario:req.usuario
    })
}