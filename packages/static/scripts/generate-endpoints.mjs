import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApiPromise, WsProvider } from "@polkadot/api";
import {
	prodParasKusamaCommon,
	prodParasPolkadot,
	prodParasPolkadotCommon,
} from "@polkadot/apps-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TIMEOUT = 20000;
const OUTPUT_FILE_NAME = "endpoints.json";

const findChainById = (config, name) => {
	const hub = config.find((key) => key.info === name);
	return Object.values(hub?.providers || {});
};

async function testEndpoint(url, network) {
	const startTime = Date.now();
	const wsProvider = new WsProvider(url);
	const api = new ApiPromise({ provider: wsProvider, noInitWarn: true });

	try {
		await Promise.race([
			api.isReady,
			new Promise((_, reject) =>
				setTimeout(() => reject(new Error("Timeout")), TIMEOUT),
			),
		]);

		return {
			network,
			url,
			responseTime: Date.now() - startTime,
			success: true,
		};
	} catch (error) {
		console.error(`Failed to connect to ${url}: ${error.message}`);
		return { network, url, success: false };
	} finally {
		if (api) api.disconnect();
		if (wsProvider) wsProvider.disconnect();
	}
}

async function findFastestEndpoint(providers, network) {
	const results = await Promise.all(
		providers.map((url) => testEndpoint(url, network)),
	);
	const successful = results.filter((r) => r.success);

	if (successful.length === 0) {
		console.error(`No successful connections for ${network}`);
		return { network, url: null, success: false, fallback: true };
	}

	return successful.reduce((fastest, current) =>
		!fastest || current.responseTime < fastest.responseTime ? current : fastest,
	);
}

const networkMap = {
	AssetHubPolkadot: {
		providers: findChainById(prodParasPolkadotCommon, "PolkadotAssetHub"),
	},
	AssetHubKusama: {
		providers: findChainById(prodParasKusamaCommon, "KusamaAssetHub"),
	},
	Hydration: {
		providers: findChainById(prodParasPolkadot, "hydradx"),
	},
};

Promise.all(
	Object.entries(networkMap).map(([network, { providers }]) =>
		findFastestEndpoint(providers, network).then((result) => [network, result]),
	),
)
	.then((results) => {
		const endpointsData = {};

		for (const [key, result] of results) {
			if (!result) {
				console.warn(`No working endpoint found for ${key}, using empty value`);
			}

			endpointsData[key] = {
				endpoint: result?.url || null,
				providers: networkMap[key].providers || [],
				responseTime: result?.responseTime,
				fallback: result?.fallback || false,
			};
		}

		const dir = path.join(__dirname, "../");

		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(
			path.join(dir, OUTPUT_FILE_NAME),
			JSON.stringify(endpointsData, null, 2),
		);

		console.log(`Endpoints data has been written to ${dir}`);

		for (const [network, data] of Object.entries(endpointsData)) {
			console.log(`Fastest ${network} provider:`, data.endpoint);
		}
	})
	.catch((error) => {
		console.error("Error:", error.message);
	})
	.finally(() => process.exit(0));
