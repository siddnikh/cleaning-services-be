var jwt = require("jsonwebtoken");
const { logger } = require('../config/logger');
const { checkIfUserExists } = require('../controllers/user');
const { User, Profile } = require("../models/User");

function getEmailFromJwt(encodedToken) {
	const decodedToken = jwt.decode(encodedToken, { complete: true });
	if (!decodedToken) {
		return null;
	}
	return decodedToken.payload.email;
}

function getJwtFromHeader(req) {
	const authHeader = req.headers["authorization"];
	if (!authHeader) {
		return null;
	}

	const allowedTokenTypes = ["Bearer"];

	const authHeaderValues = authHeader.split(" ");
	if (authHeaderValues.length === 2 && allowedTokenTypes.includes(authHeaderValues[0])) {
		return authHeaderValues;
	}

	return null;
}

async function verifyUser(req, res, next) {
	const jwtFromHeader = getJwtFromHeader(req);
	if (!jwtFromHeader) {
		res.status(401).send("No JWT provided");
		logger.error({ message: "401, No JWT provided" });
		return;
	}

	if (jwtFromHeader[0] !== "Bearer") {
		res.status(401).send("Invalid token type provided");
		logger.error({ message: "401, Invalid token type provided" });
		return;
	}

	const decodedToken = verifyJwtSignature(jwtFromHeader[1]);
	if (!decodedToken) {
		res.status(401).send("Invalid JWT");
		logger.error({ message: "401, Invalid JWT" });
		return;
	}

	const email = decodedToken.payload.email;
	const userObj = await checkIfUserExists(email);
	if (!userObj) {
		res.status(401).send("User not found");
		logger.error(`Invalid request at ${req.originalUrl}, user not found`);
		return;
	}

	const profileObj = await Profile.findOne({ where: { userId: userObj.id } });
	if (!profileObj) {
		res.status(401).send("User profile not found");
		logger.error(`Profile not found for user: ${userObj.id}`);
		return;
	}

	req.user = {
		email: userObj.email,
		phoneNumber: userObj.phoneNumber,
		username: userObj.username,
		country: userObj.country,
		userProfileId: profileObj.id,
		profile: profileObj,
		...decodedToken.payload,
	};

	next();
}

function verifyJwtSignature(encodedToken) {
	let decodedToken;
	const jwtSecret = process.env.JWT_SECRET;
	try {
		decodedToken = jwt.verify(encodedToken, jwtSecret, {
			complete: true,
			issuer: process.env.JWT_ISSUER,
		});
	} catch (error) {
		logger.error("Invalid token " + encodedToken);
		return null;
	}
	return decodedToken;
}

module.exports = {
    getEmailFromJwt,
	verifyUser,
};
