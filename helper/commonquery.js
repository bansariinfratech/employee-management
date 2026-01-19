// const { UniqueKeys, RequireKeys } = require('../config/config');

// const { getObjectId, isValidObjectId } = require('./methods');


/**
 * @param {String} action for do operation like "i" - insert, "u" - update, "d" - delete.
 * @param {Object} Schema mongoose schema model.
 * @param {Object} data which you want to store/update/delete in mongodb.
 * @param {Array} dependency array for check that the data is in use relational collection or not.
 */
const SingleRecordOperation = async (action, Schema, data, dependency = [], populateKeys = '') => {
	try {
		const response = {
			status: 500,
			message: 'Internal server error.',
			data: {}
		};

		switch (action) {
			case 'i':
				const document = new Schema(data);
				document.validateSync();
				const savedData = await document.save();

				// Convert to plain object
				const plainSavedData = savedData.toObject();

				response.status = 201;
				response.data = plainSavedData;
				response.message = `${savedData?.DBname() || `Record`} create successfully.`;
				break;

			case 'u':
				const updateDoc = await Schema.findOneAndUpdate({ _id: data._id }, { $set: data }, { runValidators: true, new: true, strict: true })
					.populate(populateKeys)
					.lean();

				if (!updateDoc) {
					response.status = 400;
					response.data = {};
					response.message = `Record not found for update.`;
				} else {
					response.status = 200;
					response.data = updateDoc;
					response.message = `Record update successfully.`;
				}

				break;

			case 'd':
				const data_in_use = [];
				for (let i = 0; i < dependency.length; i++) {
					const element = dependency[i];
					const checkData = await FindOne(element[0], element[1]);
					if (checkData.data) {
						data_in_use.push(element[2]);
					}
				}

				if (data_in_use.length > 0) {
					response.status = 409;
					response.data = {};
					response.message = `The data is already in use at ${data_in_use.join(', ')}.`;
				} else {
					const deleteDoc = await Schema.findOneAndDelete({
						_id: data._id
					});
					if (!deleteDoc) {
						response.status = 400;
						response.data = {};
						response.message = `Record not found.`;
					} else {
						response.status = 200;
						response.data = deleteDoc;
						response.message = `${deleteDoc?.DBname() || `Record`} delete successfully.`;
					}
				}
				break;

			default:
				response.status = 400;
				response.message = 'Provide valid operation action.';
				break;
		}

		return response;
	} catch (error) {

		const errorException = new Error();

		errorException.response = {
			status: 500,
			message: 'Internal server error.'
		};

		if (error.name === 'ValidationError') {
			errorException.name = 'Required Validation';

			const requiredFields = [];
			const otherErrors = [];

			Object.values(error.errors).forEach(err => {
				if (err.kind === 'required') {
                requiredFields.push(err.path); // Fallback: just use field name
				} else if (err.kind === 'enum') {
					otherErrors.push(`${err.path} must be one of ${err.properties.enumValues.join(', ')}.`);
				} else {
					otherErrors.push(`${err.path} is invalid.`);
				}
			});

			if (requiredFields.length > 0) {
				otherErrors.unshift(`The ${requiredFields.join(', ')} are required.`);
			}

			errorException.message = otherErrors.join(' ');
			errorException.response = {
				status: 409,
				message: errorException.message
			};
		}

		if (error.code === 11000) {
			errorException.name = 'Unique Validation';
            errorException.message = `The ${Object.keys(error.keyValue)
                .map(key => key)
                .join(', ')} Already Exists.`; // Fallback: just use key name
			errorException.response = {
				status: 409,
				message: errorException.message
			};
		}

		throw errorException;
	}
};

const getManual = async (Schema, pipeline, sort = {}, pagination = {}, projection = {}) => {
	try {
		const response = {
			status: 200,
			message: '',
			data: [],
			nextPage: 0,
			totalCount: 0
		};

		// Add sort stage if sort object is not empty
		if (Object.keys(sort).length > 0) {
			pipeline.push({ $sort: sort });
		}

		// Execute the count query
		let countPipeline = [...pipeline, { $count: 'totaldocs' }];
		let countResp = await Schema.aggregate(countPipeline).allowDiskUse(true);

		let totalCount = countResp?.[0]?.totaldocs ?? 0;

		// Add pagination stages if pagination object is not empty
		if (pagination.page && pagination.pageSize) {
			const page = parseInt(pagination.page);
			const pageSize = parseInt(pagination.pageSize);
			const skip = (page - 1) * pageSize;

			pipeline.push({ $skip: skip });
			pipeline.push({ $limit: pageSize });
		}

		// Add projection stage if projection object is not empty
		if (Object.keys(projection).length > 0) {
			pipeline.push({ $project: projection });
		}

		response.data = await Schema.aggregate(pipeline).allowDiskUse(true);
		// response.data = await Schema.aggregate(pipeline);

		// Calculate if there's a next page
		if (pagination.page && pagination.pageSize) {
			const page = parseInt(pagination.page);
			const pageSize = parseInt(pagination.pageSize);
			const totalPageCount = Math.ceil(totalCount / pageSize);

			response.nextPage = page < totalPageCount ? page + 1 : 0;
		}
		response.totalCount = totalCount;
		response.message = `Records fetched successfully.`;
		return response;
	} catch (error) {

		const errorException = new Error();

		errorException.response = {
			status: 500,
			message: 'Internal server error.'
		};

		throw errorException;
	}
};

/**
 * @param {Object} Schema mongoose schema model.
 * @param {Array} queryArr based on want to find document
 */
const UpdateOne = async (Schema, queryArr) => {
	try {
		const response = {
			status: 400,
			message: 'Data Not Founded.',
			data: null
		};

		const data = await Schema.findOneAndUpdate(queryArr[0], queryArr[1], {
			new: true
		}).lean();

		if (data) {
			response.status = 200;
			response.data = data;
			response.message = `Data Founded.`;
		} else {
			response.status = 400;
			response.data = null;
			response.message = `Data Not Founded.`;
		}

		return response;
	} catch (error) {
		const errorException = new Error();

		errorException.response = {
			status: 500,
			message: 'Internal server error.'
		};

		throw errorException;
	}
};

/**
 * @param {Object} Schema Mongoose schema model.
 * @param {Object} query Query object to find documents to update.
 * @param {Object} updateData Data to update the matched documents with.
 */
const UpdateMany = async (Schema, query) => {
	try {
		const response = {
			status: 400,
			message: 'Data Not Updated.',
			data: null
		};

		// Perform the updateMany operation
		const data = await Schema.updateMany(queryArr[0], queryArr[1], { new: true });

		if (data.modifiedCount > 0) {
			response.status = 200;
			response.data = data;
			response.message = `${data.modifiedCount} record(s) updated.`;
		} else {
			response.status = 400;
			response.data = null;
			response.message = 'No records matched or updated.';
		}

		return response;
	} catch (error) {

		const errorException = new Error();

		errorException.response = {
			status: 500,
			message: 'Internal server error.'
		};

		throw errorException;
	}
};

/**
 * @param {Object} Schema mongoose schema model.
 * @param {Array} queryArr based on want to find document
 */
const DeleteMany = async (Schema, query) => {
	try {
		const response = {
			status: 400,
			message: 'Data Not Deleted.',
			data: null
		};

		const data = await Schema.deleteMany(query);
		// const data = await ScheduleModel.deleteMany({ id: { $in: ["123", "456", "789"] } });

		if (data.acknowledged) {
			response.status = 200;
			response.data = data;
			response.message = `Data Deleted.`;
		} else {
			response.status = 400;
			response.data = null;
			response.message = `Data Not Deleted.`;
		}

		return response;
	} catch (error) {

		const errorException = new Error();

		errorException.response = {
			status: 500,
			message: 'Internal server error.'
		};

		throw errorException;
	}
};

/**
 * @param {Object} Schema mongoose schema model.
 * @param {Object} query based on want to find document
 */
const FindOne = async (Schema, query, populateKeys = '') => {
	try {
		const response = {
			status: 400,
			message: 'Data Not Founded.',
			data: null
		};

		const data = await Schema.findOne(query).populate(populateKeys).sort({ _id: -1 }).lean();

		if (data) {
			response.status = 200;
			response.data = data;
			response.message = `Data Founded.`;
		} else {
			response.status = 400;
			response.data = null;
			response.message = `Data Not Founded.`;
		}

		return response;
	} catch (error) {
		const errorException = new Error();

		errorException.response = {
			status: 500,
			message: 'Internal server error.'
		};

		throw errorException;
	}
};

/**
 * @param {Object} Schema mongoose schema model.
 * @param {Object} query based on want to find document
 */
const Find = async (Schema, query, populateKeys = '', sort = { _id: -1 }) => {
	try {
		const response = {
			status: 400,
			message: 'Data Not Found.',
			data: null
		};

		const data = await Schema.find(query).populate(populateKeys).sort(sort).lean();

		if (data && data.length > 0) {
			response.status = 200;
			response.data = data;
			response.message = `Data Found.`;
		} else {
			response.status = 400;
			response.data = [];
			response.message = `Data Not Found.`;
		}

		return response;
	} catch (error) {
		const errorException = new Error();

		errorException.response = {
			status: 500,
			message: 'Internal server error.'
		};

		throw errorException;
	}
};

const FindOneAndDelete = async (Schema, query) => {
	try {
		const response = {
			status: 400,
			message: 'Data Not Founded.',
			data: null
		};

		const data = await Schema.findOneAndDelete(query).lean();

		if (data) {
			response.status = 200;
			response.data = data;
			response.message = `Data deleted.`;
		} else {
			response.status = 400;
			response.data = null;
			response.message = `Data Not found.`;
		}

		return response;
	} catch (error) {
		const errorException = new Error();

		errorException.response = {
			status: 500,
			message: 'Internal server error.'
		};

		throw errorException;
	}
};

/**
 * @param {Object} Schema mongoose schema model.
 * @param {Array} querys array of oprations
 */
const BulkOperation = async (Schema, querys) => {
	try {
		const response = {
			status: 400,
			message: 'Failed to execute bulk operation.',
			data: null
		};

		const result = await Schema.bulkWrite(querys);
		// console.log("🚀 ~ BulkOperation ~ result:", result);

		if (result) {
			response.status = 200;
			response.data = result;
			response.message = `Bulk Operation Successfully Completed.`;
		} else {
			response.status = 400;
			response.data = null;
			response.message = `Failed to execute bulk operation.`;
		}

		return response;
	} catch (error) {

		const errorException = new Error();

		errorException.response = {
			status: 500,
			message: 'Internal server error.'
		};

		throw errorException;
	}
};

/**
 * @param {Object} Schema mongoose schema model.
 * @param {Array} querys array of oprations
 */
const IsAdmin = async id => {
	// try {
	// 	const response = {
	// 		status: 400,
	// 		isadmin: false
	// 	};
	// 	if (isValidObjectId(id)) {
	// 		const result = await FindOne(usersModel, { _id: getObjectId(id) });
	// 		if (result?.data?.issuperadmin) {
	// 			response.status = 200;
	// 			response.isadmin = true;
	// 		}
	// 	}
	// 	return response;
	// } catch (error) {
	// 	const errorException = new Error();
	// 	errorException.response = {
	// 		status: 500,
	// 		message: 'Internal server error.'
	// 	};
	// 	throw errorException;
	// }
};

const getDeviceIds = async accountids => {
	try {
		// Simplified - returns empty array for now
		return [];
	} catch (error) {
		console.log('Error:', error);
		return [];
	}
};

module.exports = {
	SingleRecordOperation,
	FindOne,
	Find,
	getManual,
	UpdateOne,
	FindOneAndDelete
};
