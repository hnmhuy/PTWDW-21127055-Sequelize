const express = require("express");
const app = express();
const port = 4000 | process.env.port;
const expressHbs = require("express-handlebars");
const paginate = require("express-handlebars-paginate");

app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/html"));
app.engine(
    "hbs",
    expressHbs.engine({
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials",
        defaultLayout: "layout",
        extname: "hbs",
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
        },
        helpers: {
            showDate: (date) => {
                if (date != null)
                    return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });
            },
            paginateHelper: paginate.createPagination,
        },
    })
);
app.set("view engine", "hbs");

app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.use("/blogs", require("./routes/blogRouter"));

app.get("/createTables", (req, res) => {
    let modules = require("./models");
    modules.sequelize.sync().then(() => {
        res.send("Table created");
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
