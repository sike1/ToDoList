const Tareas = require("../models/Tareas")

exports.formNuevaTarea = (req, res)=>{
    res.render("nuevatarea",{
        pagina : "Nueva Tarea",
        csrfToken: req.csrfToken(),
        usuario:req.usuario

    })
}

exports.crearTarea=async(req,res,next)=>{
    

    // Realizar las validaciones antes de intentar crear la tarea
    req.checkBody("tarea", "La tarea no puede ir vacia").notEmpty();
    req.checkBody("fecha", "La fecha no puede ir vacia").notEmpty();
    req.checkBody("hora", "La hora no puede ir vacia").notEmpty();

    // Leer los errores de express
    const erroresExpress = req.validationErrors();

    if(erroresExpress){
        const errExp = erroresExpress.map((err) => err.msg);
        req.flash("error", errExp);
        return res.redirect("/nuevatarea");
    
    }
        const{tarea,fecha,hora}=req.body

    try {

        const tareaNu = Tareas.create({
                tarea,
                fecha,
                hora,
                usuarioId : req.usuario.id
        })
        
         req.flash("exito", "Tarea guardada correctamente");
         return res.redirect("/administracion");
        
    } catch (error) {
        req.flash("error", "Ha habido un error intentelo de nuevo");
        return res.redirect("/nuevatarea");
               
    }
}


exports.formEditarTarea=async (req,res)=>{
    //extraigo el slug de la url
    const{slug} = req.params
    //busco la tarea mediante el slug
    //busco la tarea mediante el slug
    const tarea = await Tareas.findOne({where:{slug, usuarioId: req.usuario.id }})
    if(!tarea){
        req.flash("error", "Ha habido un error intentelo de nuevo");
        res.redirect("/administracion");
    }else{
        res.render("editarTarea",{
            pagina:"Editar Tarea",
            csrfToken: req.csrfToken(),
            tarea,
            usuario:req.usuario
    
        })
    }
}
//editar tarea
exports.editarTarea=async (req,res)=>{
    

    //extraigo el slug de la url
    const{slug} = req.params

    //busco la tarea mediante el slug
    const tareaE = await Tareas.findOne({where:{slug, usuarioId: req.usuario.id }})

    if(!tareaE){
        req.flash("error", "Ha habido un error intentelo de nuevo");
        res.redirect("/administracion");
    }
        
    const {tarea, fecha, hora}= req.body

    tareaE.tarea = tarea
    tareaE.fecha= fecha
    tareaE.hora= hora

    await tareaE.save()
    req.flash("exito", "Tarea editada correctamente");
    res.redirect("/administracion");
    
}
//eliminar tarea
exports.eliminarTarea=async(req,res)=>{
    //extraigo el slug de la url
    const{slug} = req.params

    //busco la tarea mediante el slug
    const tareaE = await Tareas.findOne({where:{slug, usuarioId: req.usuario.id }})

    if(!tareaE){
        req.flash("error", "Ha habido un error intentelo de nuevo");
        res.redirect("/administracion");
    }

    await tareaE.destroy()
    req.flash("exito", "Tarea Eliminada");
    res.redirect("/administracion");

}
