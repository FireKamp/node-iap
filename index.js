'use strict';

const platforms = {
	amazon: require('./lib/amazon'),
	apple: require('./lib/apple'),
	google: require('./lib/google'),
	roku: require('./lib/roku')
};

const promisify = (fn) => {
	return (...args) => {
		return new Promise((resolve, reject) => {
			fn(...args, (err, res) => {
				return (err ? reject(err) : resolve(res));
			});
		});
	};
};

function verifyPayment(platform, payment, cb) {
	function syncError(error) {
		process.nextTick(function () {
			cb(error);
		});
	}

	if (!payment) {
		return syncError(new Error('No payment given'));
	}

	const engine = platforms[platform];

	if (!engine) {
		return syncError(new Error(`Platform ${platform} not recognized`));
	}

	engine.verifyPayment(payment, function (error, result) {
		if (error) {
			return cb(error);
		}

		result.platform = platform;

		cb(null, result);
	});
}

function cancelSubscription(platform, payment, cb) {
	function syncError(error) {
		process.nextTick(function () {
			cb(error);
		});
	}

	if (!payment) {
		return syncError(new Error('No payment given'));
	}

	const engine = platforms[platform];

	if (!engine) {
		return syncError(new Error(`Platform ${platform} not recognized`));
	}

	if (!engine.cancelSubscription) {
		return syncError(new Error(`Platform ${platform} a does not have cancelSubscription method`));
	}

	engine.cancelSubscription(payment, function (error, result) {
		if (error) {
			return cb(error);
		}

		cb(null, result);
	});
}

function isCancelled(response, cb) {
	function syncError(error) {
		process.nextTick(function () {
			cb(error);
		});
	}

	if (!response) {
		return syncError(new Error('No response given'));
	}

	if (!response.transactionId) {
		return syncError(new Error('Response must have a transaction id'));
	}

	const platform = response.platform;
	const engine = platforms[platform];

	if (!engine) {
		return syncError(new Error(`Platform ${platform} not recognized`));
	}

	if (!engine.isCancelled) {
		return syncError(new Error(`Platform ${platform} does not have a isCancelled method`));
	}

	engine.isCancelled(response, function (error, result) {
		if (error) {
			return cb(error);
		}

		cb(null, result);
	});
}

function isExpired(response, cb) {
	function syncError(error) {
		process.nextTick(function () {
			cb(error);
		});
	}

	if (!response) {
		return syncError(new Error('No response given'));
	}

	if (!response.transactionId) {
		return syncError(new Error('Response must have a transaction id'));
	}

	const platform = response.platform;
	const engine = platforms[platform];

	if (!engine) {
		return syncError(new Error(`Platform ${platform} not recognized`));
	}

	if (!engine.isExpired) {
		return syncError(new Error(`Platform ${platform} does not have a isExpired method`));
	}

	engine.isExpired(response, function (error, result) {
		if (error) {
			return cb(error);
		}

		cb(null, result);
	});
}

function acknowledge(platform, payment, cb) {
	function syncError(error) {
		process.nextTick(function () {
			cb(error);
		});
	}

	if (!payment) {
		return syncError(new Error('No payment given'));
	}

	const engine = platforms[platform];

	if (!engine) {
		return syncError(new Error(`Platform ${platform} not recognized`));
	}

	if (!engine.acknowledge) {
		return syncError(new Error(`Platform ${platform} does not have an acknowledge method`));
	}

	engine.acknowledge(payment, function (error, result) {
		if (error) {
			return cb(error);
		}

		cb(null, result);
	});
}

exports.verifyPayment = (platform, payment, cb) => {
	return (cb ? verifyPayment(platform, payment, cb) : promisify(verifyPayment)(platform, payment));
};

exports.cancelSubscription = (platform, payment, cb) => {
	return (cb ? cancelSubscription(platform, payment, cb) : promisify(cancelSubscription)(platform, payment));
};

exports.isCancelled = (response, cb) => {
	return (cb ? isCancelled(response, cb) : promisify(isCancelled)(response));
};

exports.isExpired = (response, cb) => {
	return (cb ? isExpired(response, cb) : promisify(isExpired)(response));
};

exports.acknowledge = (platform, payment, cb) => {
	return (cb ? acknowledge(platform, payment, cb) : promisify(acknowledge)(platform, payment));
};
