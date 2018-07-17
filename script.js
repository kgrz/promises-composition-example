const fetch = require('node-fetch');

const openPrs = [
	1455,
	1450,
	100000000,
	1433,
	1360
];

function readMergeableStatusIfSuccess(rawresponse) {
	if (rawresponse.status === 200) {
		// note: always return promises. Never just call.
		return rawresponse.json();
	}

	// We are losing information about the actual error that happened, but for
	// this example I'm skipping that part.
	return Promise.reject({ mergeable: 'unknown' });
}

function fetchPr(prId) {
	const url = `https://api.github.com/repos/sinatra/sinatra/pulls/${prId}`;

	// we can reuse the function above for the error block,
	// because the `if` condition is entirely skipped, and we don't
	// care about the actual error in our case!
	return fetch(url).then(
		readMergeableStatusIfSuccess,
		readMergeableStatusIfSuccess
	);
}

function fetchPrAndUpdateMergeability(id, mergeability) {
	return new Promise(resolve => {
		return fetchPr(id).then(
			parsedResponse => {
				mergeability[id] = parsedResponse.mergeable;

				return resolve(mergeability);
			},
			normalizedError => {
				mergeability[id] = normalizedError.mergeable;

				// technically, we should be maintaining a list of all the
				// errors and the reasons why they happened, and/or log the
				// error in a structured log format. They help in debugging why
				// something failed. By resolving the error here, we're losing
				// information about why a PR's status is set to 'unknown'.
				return resolve(mergeability);
			}
		);
	});
}

const [firstId, ...restIds] = openPrs;

const finalPromise = restIds.reduce((promise, prId) => {
	return promise.then(mergeability =>
		fetchPrAndUpdateMergeability(prId, mergeability)
	);
}, fetchPrAndUpdateMergeability(firstId, {}));

finalPromise.then(mergeability => console.log('mergeabilty: ', mergeability));
