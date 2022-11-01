const http = require("http");
const fs = require("fs");
const db = require("./utils/database");
const formBody = require("body/form");

const server = http.createServer((req, res) => {
  formBody(req, res, (err, body) => {
    if (err) {
      console.log(err);
      res.statusCode(500);
      res.end();
    } else if (req.url === "/") {
      db.query(
        "SELECT City.id, city, Country.name AS country FROM City JOIN Country ON City.country = Country.id",
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            fs.readFile("src/views/index.html", "utf-8", (err, html) => {
              if (err) console.error(err);
              else {
                let tableBody = "";
                results.map(city => {
                  tableBody += "<tr>";
                  tableBody += `<td>${city.city}</td>`;
                  tableBody += `<td>${city.country}</td>`;
                  tableBody += `<td><a href="/city/${city.id}">Details</a></td>`;
                  tableBody += "</tr>";
                });
                html = html.replace("{tableBody}", tableBody);
                res.end(html);
              }
            });
          }
        }
      );
    } else if (req.url === "/city/create") {
      if (req.method === "GET") {
        fs.readFile("src/views/create.html", "utf-8", (err, html) => {
          if (err) console.error(err);
          db.query("SELECT * FROM Country", (err, results) => {
            if (err) console.error(err);
            let options = "";
            results.map(country => {
              options += `<option value='${country.id}'>${country.name}</option>`;
            });
            html = html.replace("{options}", options);
            html = html.replace("{action}", "Create");
            html = html.replaceAll(/{\w+}/g, "");
            res.end(html);
          });
        });
      } else {
        const { city, country, area, population, gdp, description } = body;
        const sql = `INSERT INTO City (city, country, area, population, gdp, description)
          VALUES ('${city}', ${country}, ${area}, ${population}, ${gdp}, '${description}')
        `;
        db.query(sql, (err, results) => {
          if (err) console.error(err);
          else {
            res.writeHead(302, { Location: `/city/${results.insertId}` });
            res.end();
          }
        });
      }
    } else if (req.url.match(/\/city\/\w+\/edit/)) {
      const cityId = req.url.slice(1).split("/")[1];
      if (req.method === "GET") {
        const sql = `SELECT * FROM City WHERE id = ${cityId}`;
        db.query(sql, (err, results) => {
          if (err) console.error(err);
          if (!results.length) {
            res.writeHead(302, { Location: "/" });
            res.end();
          } else {
            const { city, country, area, population, gdp, description } =
              results[0];
            fs.readFile("src/views/create.html", "utf-8", (err, html) => {
              if (err) console.error(err);
              db.query("SELECT * FROM Country", (err, results) => {
                if (err) console.error(err);
                let options = "";
                results.map(c => {
                  if (c.id === country) {
                    options += `<option value='${c.id}' selected>${c.name}</option>`;
                  } else {
                    options += `<option value='${c.id}'>${c.name}</option>`;
                  }
                });
                html = html.replace("{options}", options);
                html = html.replace("{city}", city);
                html = html.replace("{area}", area);
                html = html.replace("{population}", population);
                html = html.replace("{gdp}", gdp);
                html = html.replace("{description}", description);
                html = html.replace("{action}", "Edit");
                res.end(html);
              });
            });
          }
        });
      } else {
        const { city, country, area, population, gdp, description } = body;
        const sql = `UPDATE City
          SET city = '${city}', country = '${country}', area = ${area}, population = ${population}, gdp = ${gdp}, description = '${description}'
          WHERE id = ${cityId}
        `;
        db.query(sql, err => {
          if (err) console.error(err);
          res.writeHead(302, { Location: `/city/${cityId}` });
          res.end();
        });
      }
    } else if (req.url.match(/\/city\/\w+\/delete/)) {
      const cityId = req.url.slice(1).split("/")[1];
      if (req.method === "GET") {
        fs.readFile("src/views/delete.html", "utf-8", (err, html) => {
          if (err) console.error(err);
          res.end(html);
        });
      } else {
        const sql = `DELETE FROM City WHERE id = ${cityId}`;
        db.query(sql, err => {
          if (err) console.error(err);
          else {
            res.writeHead(302, { Location: `/` });
            res.end();
          }
        });
      }
    } else if (req.url.match(/^\/city\/\w+$/)) {
      const cityId = req.url.slice(1).split("/")[1];
      const sql = `SELECT City.id, city, area, population, gdp, description, Country.name as country FROM City JOIN Country ON City.country = Country.id WHERE City.id = ${cityId}`;
      db.query(sql, (err, results) => {
        if (err) console.error(err);
        if (!results.length) {
          res.writeHead(302, { Location: "/" });
          res.end();
        } else {
          console.log(results);
          const { city, country, area, population, gdp, description } =
            results[0];
          fs.readFile("src/views/detail.html", "utf-8", (err, html) => {
            html = html.replace("{city}", city);
            let cityDetail = "";
            cityDetail += `<div>City: ${city}</div>`;
            cityDetail += `<div>Country: ${country}</div>`;
            cityDetail += `<div>Area: ${area}</div>`;
            cityDetail += `<div>Population: ${population}</div>`;
            cityDetail += `<div>GDP: ${gdp}</div>`;
            cityDetail += `<div>Description: ${description}</div>`;
            html = html.replace("{cityDetails}", cityDetail);
            html = html.replaceAll("{cityId}", cityId);
            res.end(html);
          });
        }
      });
    } else {
      res.end("NOT FOUND");
    }
  });
});

server.listen(3000, () => console.log("Server running!"));
