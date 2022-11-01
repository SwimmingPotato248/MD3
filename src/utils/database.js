const mysql = require("mysql2");
const connection = mysql.createConnection(
  'mysql://qz95mivio95uvfhi1ryk:pscale_pw_VV0gy7MJjQBHbFjOS9jce82BhQAOlLGkZnJrXt9tYeq@ap-southeast.connect.psdb.cloud/case?ssl={"rejectUnauthorized":true}'
);

connection.connect(err => {
  if (err) throw err;
  console.log("Connected");
});

module.exports = connection;
