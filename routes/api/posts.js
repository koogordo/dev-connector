const express = require('express');
const router = express.Router();

//@route  GET api/posts/test
//@desc   Test the users route
//@access public
router.get('/test', (req, res) => {
  res.json({ msg: 'Posts Works' });
});
module.exports = router;
