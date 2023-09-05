/** Server startup for Message.ly. */

const app = require("./app");

const port = 3000;
app.listen(port, function () {
	console.log(`Listening on ${port}`);
});
