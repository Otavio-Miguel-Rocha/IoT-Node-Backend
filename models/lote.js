const { DataTypes, Model } = require("sequelize");
const connection = require("../database/connection");

class Lote extends Model {}

Lote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    quantidadeLeite: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM("INTEGRAL", "SEMIDESNATADO", "DESNATADO", "SEM LACTOSE"),
      allowNull: false,
    },
    dataOrdenha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    origem: {
        type: DataTypes.STRING,
        allowNull: false,
      },
  },
  {
    sequelize: connection,
    modelName: "Lote",
  }
);

Lote.sync(
  {
    alter:true
  }
)
  .then(() => {
    console.log("Lote Sincronizado");
  })
  .catch((e) => {
    console.log("Lote não Sincroniza: ", e);
  });

module.exports = Lote;