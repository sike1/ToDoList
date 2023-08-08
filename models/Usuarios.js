const Sequelize = require("sequelize");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const Usuarios = db.define(
  "usuarios",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: Sequelize.STRING(60),
    imagen: Sequelize.STRING(60),
    email:{
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: true,
      validate:{
          isEmail:{msg:"Introduce un email valido"},
          isUnique: function(value, next){
              var self = this;
              Usuarios.findOne({where: {email: value}}).then(function(usuario){
                  if(usuario && self.id != usuario.id){
                      return next("El Usuario ya existe")
                  }
                  return next()
              })
              .catch(function(err){
                  return next(err)
              })
          }
      },
      
  },
    password: {
      type: Sequelize.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La contraseña no puede ir vacia",
        },
      },
    },
    activo: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    token: {
      type: Sequelize.STRING,
      defaultValue: 0,
    }
  },
  {
    hooks: {
      beforeCreate(usuario) {
        usuario.password = Usuarios.prototype.hashPassword(usuario.password)
      },
    },
    scopes:{
      eliminarPassword:{
        attributes:{
          exclude: ["password","activo"]
        }
      }
    }
  }
);

//metodo para comparar password
Usuarios.prototype.validarPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
//metodo para hashear password
Usuarios.prototype.hashPassword = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10),null)
}


module.exports = Usuarios;
