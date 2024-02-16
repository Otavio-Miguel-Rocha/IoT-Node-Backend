const Sequelize = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database/database.sqlite",
});

async function database() {
  try {
    await sequelize.authenticate();
    console.log("Banco conectado com sucesso");
  } catch (error) {
    console.log("Conexão falhou: ", error);
  }
}   

database().then();

module.exports = sequelize;