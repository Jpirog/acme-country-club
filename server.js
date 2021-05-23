const { syncAndSeed } = require('./db'); // connect to database and seed tables
async function init () {
  await syncAndSeed()
}
init()

const express = require("express");
const app = express();
const routes = require('./routes')
const morgan = require("morgan");
app.use(morgan("dev"));
app.use('/api', routes)

app.get('/api', (req, res, next) => {
  res.redirect('/api/facilities')
})

app.get("*", (req, res) => { // rather than a 404, just send them to the main page
  res.redirect("/api");
})

const PORT = 1342;

app.listen(PORT, () => {
  console.log(`App listening in port ${PORT}`);
});
