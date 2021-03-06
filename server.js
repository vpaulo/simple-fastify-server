const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const fastify = require("fastify")({ logger: true });
const port = 3000;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', worker => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    fastify.register(require("point-of-view"), {
        engine: {
            nunjucks: require('nunjucks')
        }
    });

    // Declare a route
    fastify.get("/", (request, reply) => {
        // reply.send({ hello: "world"});
        reply.view('/templates/base.html', { title: 'Test page', hello: 'world' });
    });

    // Run the server!
    fastify.listen(port, err => {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
        fastify.log.info(`server listening on ${fastify.server.address().port}, PID: ${process.pid}`);
    });
}