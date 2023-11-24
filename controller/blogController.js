const controller = {};
const models = require("../models");
const limit = 3;

function reProcessData(datas) {
    // Only get the dataValues from each datas
    let newData = datas.map((data) => data.dataValues);
    console.log(newData);
    return newData;
}

controller.showList = async (req, res) => {
    res.locals.categories = await models.Category.findAll({
        attributes: ["id", "name"],
        include: [{ model: models.Blog }],
    });

    res.locals.tags = await models.Tag.findAll({
        attributes: ["id", "name"],
    });

    let page = Number(req.query.page) || 1;
    let category = req.query.category;
    let tag = req.query.tag;
    let keyword = req.query.search;
    if (category) {
        let { count, rows: blogs } = await models.Blog.findAndCountAll({
            limit: limit,
            offset: (page - 1) * limit,
            attributes: [
                "id",
                "title",
                "imagePath",
                "summary",
                "createdAt",
                "categoryId",
                [
                    models.Sequelize.literal(
                        '(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
                    ),
                    "comments",
                ],
            ],
            where: { categoryId: category },
        }).catch((err) => console.log(err));

        res.render("index", {
            blogs: reProcessData(blogs),
            pagination: {
                page: page,
                limit: limit,
                totalRows: count,
                queryParams: { category: category },
            },
        });
    } else if (tag) {
        let { count, rows: blogs } = await models.Blog.findAndCountAll({
            limit: limit,
            offset: (page - 1) * limit,
            attributes: [
                "id",
                "title",
                "imagePath",
                "summary",
                "createdAt",
                "categoryId",
                [
                    models.Sequelize.literal(
                        '(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
                    ),
                    "comments",
                ],
            ],
            include: [
                {
                    model: models.Tag,
                    where: { id: tag },
                },
            ],
        }).catch((err) => console.log(err));
        res.render("index", {
            blogs: reProcessData(blogs),
            pagination: {
                page: page,
                limit: limit,
                totalRows: count,
                queryParams: { tag: tag },
            },
        });
    } else if (keyword) {
        let { count, rows: blogs } = await models.Blog.findAndCountAll({
            limit: limit,
            offset: (page - 1) * limit,
            attributes: [
                "id",
                "title",
                "imagePath",
                "summary",
                "createdAt",
                "categoryId",
                [
                    models.Sequelize.literal(
                        '(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
                    ),
                    "comments",
                ],
            ],
            where: { title: { [models.Sequelize.Op.iLike]: `%${keyword}%` } },
        }).catch((err) => console.log(err));
        if (count === 0) {
            res.render("notFound", {
                blogs: reProcessData(blogs),
                pagination: {
                    page: page,
                    limit: limit,
                    totalRows: count,
                    queryParams: { search: keyword },
                },
            });
        } else {
            res.render("index", {
                blogs: reProcessData(blogs),
                pagination: {
                    page: page,
                    limit: limit,
                    totalRows: count,
                    queryParams: { search: keyword },
                },
            });
        }
    } else {
        let { count, rows: blogs } = await models.Blog.findAndCountAll({
            limit: limit,
            offset: (page - 1) * limit,
            attributes: [
                "id",
                "title",
                "imagePath",
                "summary",
                "createdAt",
                "categoryId",
                [
                    models.Sequelize.literal(
                        '(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
                    ),
                    "comments",
                ],
            ],
        }).catch((err) => console.log(err));
        res.render("index", {
            blogs: reProcessData(blogs),
            pagination: {
                page: page,
                limit: limit,
                totalRows: count,
            },
        });
    }
};

controller.showDetails = async (req, res) => {
    res.locals.categories = await models.Category.findAll({
        attributes: ["id", "name"],
        include: [{ model: models.Blog }],
    });

    res.locals.tags = await models.Tag.findAll({
        attributes: ["id", "name"],
    });
    let id = isNaN(req.params.id) ? 0 : Number(req.params.id);
    res.locals.blog = await models.Blog.findOne({
        attributes: ["id", "title", "description", "createdAt"],
        where: { id: id },
        include: [
            { model: models.Comment },
            { model: models.User },
            { model: models.Tag },
            { model: models.Category },
        ],
    }).catch((err) => console.log(err));
    res.render("details");
};

module.exports = controller;
