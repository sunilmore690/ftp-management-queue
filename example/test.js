// var queue = require('../initializers/queue');
// var config = require('../config/default');
var uploader = require("../lib/uploader");
var kue = require("kue");
let queue = kue.createQueue({
  prefix: "test-queue-q",
  redis: {
    port: 6379,
    host: "localhost",
    //   auth: 'password',
    db: 3, // if provided select a non-default redis db
    options: {
     
    }
  }
});

const sendEmail = (job, ctx, done) => {
    setTimeout(function(){
        done();
    },1000)
};

const processFile = (params, cb) => {
  if (!this.job) {
    this.job = {
      log() {
        console.log(arguments);
      }
    };
  }
  let i = 0;
  let intervalObject = setInterval(()=>{
    this.job.log(i++)
  },1000)
  setTimeout(function(){
    clearInterval(intervalObject)
    cb()
  },10000)
};

const options = {
  kue,
  queue,
  fileFormats: [".csv"],
  numberOfProcess: {
    itemsManagerProcess: 1,
    fileBatchProcess: 1,
    emailProcess: 2,
  },
  processNames: {
    manager: "manager-queue", //queue name for manager process
    processor: "processor-queue", //queue name for file processor process
  },
  items: [
    {
      id: "1",
      name: "job",
      priority: "normal",

      ftp: {
        host: "<localhost>",
        port: 21,
        user: "<user>",
        password: "<pass>",
        pass: "<pass>",
      },
      dir: {
        upload: "/upload/",
        enqueued: "/enqueued/",
        processing: "/processing/",
        error: "/error/",
        processed: "/processed/",
        backup: "/backup/",
      },
    },
  ],
  cbemailfunction: sendEmail,
  customCallback: processFile,
  filePath: __dirname,
};

uploader(options);
