import { fileURLToPath } from "node:url";
import { transform } from "oxc-transform";

const extensionsRegex = /\.tsx?$/;

export async function load(url, context, nextLoad) {
	if (extensionsRegex.test(url)) {
		const { source: rawSource } = await nextLoad(url, {
			...context,
			format: "module",
		});

		const { code, map } = transform(fileURLToPath(url), rawSource.toString(), {
			sourcemap: true,
		});

		// TODO this should be handled by oxc with an inline sourcemap option
		const mapString = JSON.stringify(map);
		const sourceWithMap = `${code}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(
			mapString,
		).toString("base64")}`;

		return {
			format: "module",
			shortCircuit: true,
			source: sourceWithMap,
		};
	}

	// Let Node.js handle all other URLs.
	return nextLoad(url);
}
