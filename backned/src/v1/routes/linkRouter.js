var express = require('express');
var router = express.Router();
const linkController = require('../controllers/linkController');

router.post('/', linkController.createLink);

router.get('/', linkController.getLinks);
router.get('/:id', linkController.getLink);

router.put('/:id/tags', linkController.updateLinkTags);
router.put('/:id', linkController.updateLink);

router.delete('/:id', linkController.deleteLink);

module.exports = router;
