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
        });

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
        });
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
        });
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
        });
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
    });
    res.render("details");
};

controller.showCategory = async (req, res) => {
    res.locals.categories = await models.Category.findAll({
        attributes: ["id", "name"],
        include: [{ model: models.Blog }],
    });

    res.locals.tags = await models.Tag.findAll({
        attributes: ["id", "name"],
    });

    let category = isNaN(req.params.category) ? 0 : Number(req.params.category);
    res.locals.blogs = await models.Blog.findAll({
        attributes: [
            "id",
            "title",
            "imagePath",
            "summary",
            "createdAt",
            "categoryId",
        ],
        include: [{ model: models.Comment }],
        where: { categoryId: category },
    });
    res.render("index");
};

controller.showTag = async (req, res) => {
    let tag = isNaN(req.params.tag) ? 0 : Number(req.params.tag);
    res.locals.categories = await models.Category.findAll({
        attributes: ["id", "name"],
        include: [{ model: models.Blog }],
    });
    res.locals.tags = await models.Tag.findAll({
        attributes: ["id", "name"],
    });
    res.locals.blogs = await models.Blog.findAll({
        atrributes: ["id", "title", "imagePath", "summary", "createdAt"],
        include: [
            { model: models.Comment },
            { model: models.Tag, where: { id: tag } },
        ],
    });
    res.render("index");
};

controller.searchBlogs = async (req, res) => {
    let keyword = req.query.keyword;
    res.locals.categories = await models.Category.findAll({
        attributes: ["id", "name"],
        include: [{ model: models.Blog }],
    });
    res.locals.tags = await models.Tag.findAll({
        attributes: ["id", "name"],
    });

    res.locals.blogs = await models.Blog.findAll({
        attributes: ["id", "title", "imagePath", "summary", "createdAt"],
        include: [
            { model: models.Comment },
            { model: models.Tag },
            { model: models.Category },
            { model: models.User },
        ],
        where: {
            [models.Sequelize.Op.or]: [
                { title: { [models.Sequelize.Op.iLike]: `%${keyword}%` } },
                {
                    description: {
                        [models.Sequelize.Op.iLike]: `%${keyword}%`,
                    },
                },
                {
                    "$User.firstName$": {
                        [models.Sequelize.Op.iLike]: `%${keyword}%`,
                    },
                },
                {
                    "$User.lastName$": {
                        [models.Sequelize.Op.iLike]: `%${keyword}%`,
                    },
                },
                {
                    "$Category.name$": {
                        [models.Sequelize.Op.iLike]: `%${keyword}%`,
                    },
                },
                {
                    "$Tags.name$": {
                        [models.Sequelize.Op.iLike]: `%${keyword}%`,
                    },
                },
            ],
        },
    });

    if (res.locals.blogs.length == 0) {
        res.render("notfound");
    } else {
        res.render("index");
    }
};

module.exports = controller;
