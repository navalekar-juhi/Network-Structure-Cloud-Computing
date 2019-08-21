const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();
const book = require('../routes/api/book');
const user = require('../routes/api/users');
const moment = require('moment');
const expect = chai.expect;

chai.use(chaiHttp);

//Get all the books
describe('Get book', () => {
    it('Get book status code as success and return type as object', (done) => {
        chai.request(server)
            .get('/book')
            .set('Authorization', 'Basic TWFtdGE6TWFtdGFAMTIzNA==')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.a('object');
                done();
            });
    });
})

describe('Create User', () => {
    it('Create User', (done) => {
        let user = {
            username: "Babli",
            password: "Babli@1234"
        }
        chai.request(server)
            .post('/user/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
});

describe('Get a User', () => {
    it('Get a User status code as success', (done) => {

        let time = moment().format();
        chai.request(server)
            .get('/')
            .set('Authorization', 'Basic TWFtdGE6TWFtdGFAMTIzNA==')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});

describe('Create a book', () => {
    it('Post book status to be success', (done) => {
        let book = {
            title: "China Rich Girlfriend",
            author: "Kevin kwan",
            isbn: "CH1234",
            quantity: 5
        }
        chai.request(server)
            .post('/book')
            .set('Authorization', 'Basic TWFtdGE6TWFtdGFAMTIzNA==')
            .send(book)
            .end((err, res) => {
                res.should.have.status(201);
                done();
            });
    });
});

describe('PUT book status to be success', () => {
    it('PUT book status to be success', (done) => {
        let book = {
            id: "d8f55d4a-0e36-4f03-9f1d-2debfd89ec75",
            title: "cuckoo calling",
            author: "J K Rowling",
            isbn: "C1234",
            quantity: 3
        }
        chai.request(server)
            .put('/book')
            .set('Authorization', 'Basic TWFtdGE6TWFtdGFAMTIzNA==')
            .send(book)
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    })

});

