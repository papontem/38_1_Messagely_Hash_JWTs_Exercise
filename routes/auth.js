const Router = require("express").Router;
const router = new Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
	try {
		let { username, password } = req.body;
		// PAM: bcrypt checking passes ussr and pass
		if (await User.authenticate(username, password)) {
			// create JSON WEB TOKEN
			let token = jwt.sign({ username }, SECRET_KEY);
			// login user update time
			User.updateLoginTimestamp(username);

			return res.json({ token });
		} else {
			throw new ExpressError("Invalid username/password", 400);
		}
	} catch (e) {
		return next(e);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
	try {
        // extract username from usr object returned by register
		let { username } = await User.register(req.body);

		// create JSON WEB TOKEN
		let token = jwt.sign({ username }, SECRET_KEY);
        
		// login user update time
		User.updateLoginTimestamp(username);

		return res.json({ token });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
