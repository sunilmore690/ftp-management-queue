let Uploader = require("./uploader"),
  kue = require("kue"),
  common = require("../common/index");

const fs = require("fs");

let moveFileToErrorDir = function(item) {
  console.log("----Moving file from processing to error ---", item.file);
  common.moveFile(
    item.brand.ftp,
    item.brand.dir.processing + item.file.name,
    item.brand.dir.error + item.file.name,
    item.brand.type,
    function(err) {
      console.log(err);
    }
  );
};

const deleteLocalFile = function(files) {
  files.forEach(function(file) {
    if (fs.existsSync("file")) {
      fs.unlinkSync(file);
    }
  });
};

module.exports = function(queue, cbuploader, globalPath, numberOfProcess,processname) {
 let processNames = processname
  console.log(globalPath);
  var brandHash = {};
  queue.process(processNames.processor, numberOfProcess, function(job, ctx, done) {
    job.log("-----process----");
    let item = job.data;
    if (item != undefined && brandHash[job.data.optId] == undefined) {
      brandHash[job.data.optId] = 1;
      let uploader = new Uploader(item, job, globalPath, queue,processNames);
      uploader.cbuploader = cbuploader;
      uploader.on("error", function(err) {
        console.log("++++error++++++");
        console.log(err);
        delete brandHash[job.data.optId];
        moveFileToErrorDir(item);
        deleteLocalFile([uploader.localFile, uploader.modifiedFile]);
        common.sendErrorEmail(queue, uploader.item, err.message,processNames.email);
        done(err);
      });
      uploader.on("done", function(message) {
        job.progress(90, 100);
        console.log("done", message);
        delete brandHash[job.data.optId];
        deleteLocalFile([uploader.localFile, uploader.modifiedFile]);
        // moveFileToProcessedDir(message);
        done(null, item);
      });
      uploader.start();
    } else {
      var delay = 60 * 5 * 1000;
      console.log("in line number 39");
      console.log(job.id);
      console.log(job.data.brand.name);
      job.log(job.data.file.name, " file will process in next iteration...");

      common.addBrandFileToQueue(
        queue,
        job.data.brand,
        job.data.file,
        job.data.brand.priority,
        delay,
        processNames.processor,
        function(cb) {
          done(null, item);
          // cb();
        }
      );
    }
  });
};
