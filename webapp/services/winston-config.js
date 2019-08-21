const winston = require('winston');
const path = require('path');

// const logConfiguration = {
    
// }

const logger = winston.createLogger({
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
        ),
    transports: [
    //new winston.transports.Console()
    new winston.transports.File({
        filename: path.resolve(__dirname, '../var/webapp.log')
    })
]});
//console.log(__dirname);
//logger.info('all books retrieved');
module.exports = logger;