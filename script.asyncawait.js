const fetch = require('node-fetch');

const openPrs = [
	1455,
	1450,
	100000000,
	1433,
	1360
];

async function readMergeableStatusIfSuccess(rawresponse) {
	if (rawresponse.status === 200) {
		return rawresponse.json();
	}

	// I'm keeping this as a Promise for now
	return Promise.resolve({ mergeable: 'unknown' });
}

async function fetchPr(prId) {
	const url = `https://api.github.com/repos/sinatra/sinatra/pulls/${prId}`;

	// we can reuse the function above for the error block,
	// because the `if` condition is entirely skipped, and we don't
	// care about the actual error in our case!
	const rawresponse = await fetch(url);
	const mergeableState = await readMergeableStatusIfSuccess(rawresponse);

	return mergeableState;
}

async function fetchPrAndUpdateMergeability(id, mergeability) {

	try {
		const mergeableState = await fetchPr(id);
		mergeability[id] = mergeableState.mergeable;
	} catch (e) {
		mergeability[id] = 'unknown';
	}

	return mergeability;
}

const [firstId, ...restIds] = openPrs;

const finalPromise = restIds.reduce((promise, prId) => {
	return promise.then(mergeability =>
		fetchPrAndUpdateMergeability(prId, mergeability)
	);
}, fetchPrAndUpdateMergeability(firstId, {}));

finalPromise.then(mergeability => console.log('mergeabilty: ', mergeability));
