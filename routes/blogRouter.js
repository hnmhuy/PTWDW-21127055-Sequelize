const express = require("express");
const router = express.Router();
const controller = require("../controller/blogController");

router.get("/", controller.showList);
router.get("/:id", controller.showDetails);
// router.get("/search", controller.searchBlogs);
// router.get("/category/:category", controller.showCategory);
// router.get("/tag/:tag", controller.showTag);

module.exports = router;
