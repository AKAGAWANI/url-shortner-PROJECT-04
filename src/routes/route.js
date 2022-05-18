const express = require('express');
const router = express.Router();
const urlController = require("../controllers/urlControllers")

// Create Url
router.post("/createUrl",urlController.createUrl)
router.get("/:urlCode", urlController.getUrl)

module.exports = router;