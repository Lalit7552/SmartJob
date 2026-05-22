const express = require("express");
const { listMessages, listThreads } = require("../controllers/chatController");
const { authAny } = require("../middleware/authAny");

const router = express.Router();

router.get("/messages", authAny({ kind: "auth" }), listMessages);
router.get("/threads", authAny({ kind: "auth" }), listThreads);

module.exports = router;
