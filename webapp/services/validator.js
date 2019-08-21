const validator = require('password-validator');

var schema = new validator();

schema.is().min(9);
schema.is().max(20);
schema.has().uppercase();
schema.has().lowercase();
schema.has().digits();
schema.has().not().spaces();
schema.has().symbols();

module.exports = schema;