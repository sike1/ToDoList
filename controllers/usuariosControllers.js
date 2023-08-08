const Usuarios = require("../models/Usuarios");
const fs = require("fs")
const shortid = require("shortid")
const multer = require("multer")
const enviarEmail = require("../helpers/email.js")



const configuracionMulter ={
  limits : { fileSize : 300000},
  storage: fileStorage = multer.diskStorage({
      destination:(req,file,next)=>{
          next(null,__dirname+"/../public/uploads/")
      },
      filename: (req,file,next)=>{
          const extension = file.mimetype.split("/")[1]
          next(null,`${shortid.generate()}.${extension}`)
      }
  }),
  fileFilter(req, file, cb) {
      if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
          // el callback se ejecuta como true o false : true cuando la imagen se acepta
          cb(null, true);
      } else {
          cb(new Error('Formato No Válido'),false);
      }
  }
}


const upload = multer(configuracionMulter).single("imagen")


//subir imagen al servidor
exports.subirImagen = (req, res, next)=>{

  upload(req,res,function(error){
      if(error){
          if(error instanceof multer.MulterError){
              if(error.code == "LIMIT_FILE_SIZE"){
                      req.flash("error", "Archivo muy grande. Max: 300Kb")
                  } else {
                      req.flash("error", error.message)
                  }
          } else if(error.hasOwnProperty("message")) {
              req.flash("error", error.message)
          }
          res.redirect("back")
          return
      }else{
          next()
      }
  })
}


exports.formCrearCuenta = (req, res) => {
  res.render("crearCuenta", {
    pagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

exports.crearCuenta = async (req, res) => {
  const usuario = req.body;

  // Realizar las validaciones antes de intentar crear el usuario
  req.checkBody("confirmar", "Repetir Contraseña no puede ir vacío").notEmpty();
  req
    .checkBody("confirmar", "La Contraseña es diferente")
    .equals(req.body.password);

  // Leer los errores de express
  const erroresExpress = req.validationErrors();

  // Comprobar si hay errores de validación antes de crear el usuario
  if (erroresExpress) {
    // Si hay errores de validación, redirige a la página de registro con los errores mostrados
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect("/crearCuenta");
  } 
  
    try {
      await Usuarios.create(usuario);
      // Url de confirmación
      const url = `http://${req.headers.host}/confirmarCuenta/${usuario.email}`;

      // Enviar email de confirmación
      await enviarEmail.enviarEmail({
          usuario,
          url, 
          subject : 'Confirma tu cuenta de ToDoList',
          archivo : 'confirmarCuenta'
      });
      // Si no hay errores, se crea el usuario en la base de datos y se redirige a otra página, si es necesario.
      req.flash("exito", "Cuenta creada, hemos enviado un correo para que confirmes tu cuenta");
      res.redirect("/");
    } catch (error) {
      // Manejo de errores de Sequelize si ocurre algún problema con la creación del usuario
    
        const erroresSequelize = error.errors.map((err) => err.message);
        req.flash("error", erroresSequelize);
        res.redirect("/crearCuenta");
      
     
  }
};



exports.formEditarPerfil=async(req,res)=>{

  const usuario = await Usuarios.findByPk(req.usuario.id)

  if(!usuario){
    req.flash("error", "Error vuelve a intentarlo");
    return res.redirect("/administracion")
  }

  res.render("editarPerfil", {
    pagina: "Editar Perfil",
    csrfToken: req.csrfToken(),
    usuario
  });
}

exports.editarPerfil=async(req,res)=>{

  req.checkBody("email", "El email no puede ir vacio").notEmpty();
  req.checkBody("nombre", "El nombre no puede ir vacio").notEmpty();
   // Leer los errores de express
   const erroresExpress = req.validationErrors();

   // Comprobar si hay errores de validación antes de crear el usuario
   if (erroresExpress) {
     // Si hay errores de validación, redirige a la página de registro con los errores mostrados
     const errExp = erroresExpress.map((err) => err.msg);
     req.flash("error", errExp);
     return res.redirect("/editarPerfil");
   } 

  
    const {email,nombre}=req.body

    const usuario = await Usuarios.findOne({where:{id:req.usuario.id}})

    usuario.nombre = nombre
    usuario.email= email

    //Compruebo si hay imagen en el req y si el usuaario tenia imagen para a si eliminarla
    if(req.file && usuario.imagen){
      
      const imagenAnteriorPath = __dirname +`/../public/uploads/${usuario.imagen}`
        //eliminar archivo cn fs
        fs.unlink(imagenAnteriorPath, (error)=> {
            if(error){
                console.log(error)
            }
            return
        })
    }
    //asigno la imagen al usuario
    if(req.file){
      usuario.imagen = req.file.filename
    }

    try {

      await usuario.save()
      req.flash("exito", "Cambios Guardados correctamente");
      res.redirect("/editarPerfil");
    } catch (error) {
      // Manejo de errores de Sequelize si ocurre algún problema con la creación del usuario
      const erroresSequelize = error.errors.map((err) => err.message);
      req.flash("error", erroresSequelize);
      res.redirect("/editarPerfil");
  }

}


exports.mostrarPerfil=async(req,res)=>{
  const usuario = await Usuarios.findByPk(req.usuario.id)

  if(!usuario){
    req.flash("error", "Ha habido un error, intentelo de nuevo")
    return res.redirect("/administracion")
  }

  res.render("frontEnd/mostrarPerfil",{
    pagina: `Perfil de: ${usuario.nombre}`,
    csrfToken: req.csrfToken(),
    usuario,
  })
}



exports.confirmarCuenta=async(req,res)=>{
  const usuario =await Usuarios.findOne({where:{email:req.params.email}})

  if(!usuario){
    req.flash("error", "Ese usuario ya no existe")
    return res.redirect("/")
  }

  //confirmamos la cuenta
  usuario.activo = 1
  //Guardamos de nuevo en BD
  await usuario.save()

  req.flash("exito", "Tu cuenta ha sido activada correctamente")
  return res.redirect("/")

}


