const express = require("express");
const app = express();
const port = 40233;
const { computeXPlatform } = require("./helpers/encryption");

const getXPlatformHandler = async (_, res) => {
	const xPlatform = await computeXPlatform();
	res.status(200).send(xPlatform).end();
};
app.get("/x-platform", getXPlatformHandler);
app.listen(port, () => {
	console.log(`Server is listening at http://localhost:${port}`);
});
