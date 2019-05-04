const {getProposalsSchema} = require('../schemas');


async function getProposals(fastify, request) {

    return new Promise(async (resolve, reject) => {
        const db = fastify.mongo.db;
        const collection = db.collection('workerproposals');

        const status = request.query.status || 0;
        const skip = request.query.skip || 0;
        const limit = request.query.limit || 20;
        const arbitrator = request.query.arbitrator || null;
        const proposer = request.query.proposer || null;
        const proposals = {results: [], count: 0};

        const query = {status};
        if (arbitrator){
            query.arbitrator = arbitrator;
        }
        if (proposer){
            query.proposer = proposer;
        }
        try {
            const res = await collection.find(query).sort({block_num: -1}).skip(skip).limit(limit);
            const count = await res.count();

            if (count === 0){
                resolve(proposals);
            }
            else {
                res.forEach((prop) => {
                    delete prop._id;
                    proposals.results.push(prop);
                }, () => {
                    proposals.count = count;

                    resolve(proposals);
                });
            }
        }
        catch (e){
            reject(e);
        }

    });

}


module.exports = function (fastify, opts, next) {
    fastify.get('/proposals', {
        schema: getProposalsSchema.GET
    }, async (request, reply) => {
        reply.send(await getProposals(fastify, request));
    });
    next()
};
