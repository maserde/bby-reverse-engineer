const axios = require('axios')
const crypto = require('crypto')
axios.defaults.withCredentials = true

const AndroidID = "aaaaaaaaaaaaaaaa";
const AppVersion = "25.1.15";
const ClientType = "android";
const UserAgent = "Bby-Android/25.1.15 APPSTORE Mozilla/5.0 (Linux; Android 14; SM-F721B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/132.0.6834.122 Mobile Safari/537.36";
const PKUrl = "https://www.bestbuy.com/api/csiservice/v2/key/DEVICE-METADATA";

const getPublicKey = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await axios.get(PKUrl, {
				headers: {
					'User-Agent': UserAgent,
					'X-App-Version': AppVersion,
					'X-Client-Type': ClientType
				}
			});
			if (!response.data?.publicKey) throw new Error('Public key is empty!')
			resolve((await response).data.publicKey)
		} catch (err) {
			reject(err)
		}
	})
}

const computePayload = () => {
	const expirationTime = Date.now() + 900000;
	return JSON.stringify({ identifierForVendor: AndroidID, channel: "AndroidTablet", expirationTime: expirationTime.toString() + "000000" });
}

const validatePublicKey = (pemEncodedPublicKey) => {
	if (pemEncodedPublicKey.includes("-----BEGIN PUBLIC KEY-----")) {
	} else {
		throw new Error("Failed to fetch public key: " + pemEncodedPublicKey);
	}
}

const publicKeyEncryptPayload = (pemEncodedPublicKey, payload) => {
	const publicKeyBuffer = Buffer.from(pemEncodedPublicKey, 'utf-8')
	const payloadBuffer = Buffer.from(payload, 'utf-8')
	const rsaPublicKey = crypto.createPublicKey({
		key: publicKeyBuffer,
		format: 'pem'
	})
	return crypto.publicEncrypt({
		key: rsaPublicKey,
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: 'sha1'
	}, payloadBuffer)
}

const computeXPlatform = async () => {
	console.log(`[INFO] Fetching public key..`)
	const pemEncodedPublicKey = await getPublicKey()
	validatePublicKey(pemEncodedPublicKey)
	console.log(`[INFO] Public key: ${pemEncodedPublicKey}`)
	console.log(`[INFO] Computing payload..`)
	const payload = computePayload()
	console.log(`[INFO] Computed payload: ${payload}`)
	console.log(`[INFO] Encrypting payload..`)
	const encrpytedPayload = publicKeyEncryptPayload(pemEncodedPublicKey, payload)
	const base64EncodedEncryptedPayload = Buffer.from(encrpytedPayload).toString('base64')
	console.log(`[INFO] Base64 encoded payload: ${base64EncodedEncryptedPayload}`)
	return base64EncodedEncryptedPayload
}

module.exports = {
	computeXPlatform
}