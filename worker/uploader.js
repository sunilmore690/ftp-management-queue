let events = require("events"),
  FtpClient = require("ftp"),
  fs = require("fs"),
  common = require("../common"),
  path = require("path"),
  _ = require("underscore");

class Uploader extends events {
  constructor(item, job, globalPath, queue) {
    super();
    this.producterrors = [];
    this.queue = queue;
    this.item = item;
    this.job = job;
    this.isRunning = false;
    this.globalPath = globalPath;

    this.upload_type = common.getUploadType(this.item.file.name);
    this.job.log("--UPLOAD TYPE--", this.upload_type);
    this.ftpclient = new FtpClient();
  }
  start() {
    var that = this;
    this.job.log("--------Start-----------");
    this.ftpclient.connect(this.item.brand.ftp);
    this.ftpclient.on("error", function(err) {
      that.emit("error", err);
    });
    // that.emit("error", { message: "Custom Error" });
    this.moveFileToProcessingDir();
  }
  moveFileToProcessingDir() {
    console.log(this.item);
    console.log("36363636636363");

    this.job.log("--------moveFileToProcessingDir-----------");
    var brand = this.item.brand,
      file = this.item.file,
      that = this;
    this.job.progress(10, 100);
    this.ftpclient.rename(
      brand.dir.enqueued + file.name,
      brand.dir.processing + file.name,
      function(err) {
        // that.ftpclient.end();
        if (err) {
          that.job.log(
            "Ftp Error: moving file from " +
              brand.dir.enqueued +
              file.name +
              " to" +
              brand.dir.processing +
              file.name
          );
          that.emit("error", err);
          return;
        }
        that.downloadFileFromFtp();
      }
    );
    // this.downloadFileFromFtp();
  }
  downloadFileFromFtp() {
    if (!fs.existsSync(this.globalPath + "/temp/")) {
      fs.mkdirSync(this.globalPath + "/temp/");
    }
    this.job.log("------- downloadFileFromFtp ------- ");
    this.job.progress(30, 100);
    let that = this;
    let brandTempDir = this.globalPath + "/temp/" + this.item.brand.optId + "/";
    if (!fs.existsSync(brandTempDir)) {
      fs.mkdirSync(brandTempDir);
    }
    if (!fs.existsSync(path.join(this.globalPath, "prev"))) {
      fs.mkdirSync(path.join(this.globalPath, "prev"));
    }
    this.job.log("brandTempdir", brandTempDir);
    this.tempFile = brandTempDir + that.item.file.name;
    this.job.log(
      "localfile",
      this.globalPath +
        "/temp/" +
        this.item.brand.optId +
        "/" +
        that.item.file.name
    );
    this.localFile =
      this.globalPath +
      "/temp/" +
      this.item.brand.optId +
      "/" +
      that.item.file.name;
    this.ftpclient.get(
      this.item.brand.dir.processing + this.item.file.name,
      function(err, stream) {
        // that.ftpclient.end();
        console.log("error", err);
        if (err) return that.emit("error", err);
        stream.once("close", function() {
          that.ftpclient.end();
          if (that.cbuploader && typeof that.cbuploader == "function") {
            return that.customuploader();
          } else {
            return;
          }
        });
        stream.pipe(fs.createWriteStream(brandTempDir + that.item.file.name));
      }
    );
  }

  async customuploader() {
    let that = this;
    let param = {
      fileName: this.item.file.name,
      filePath: this.tempFile,
      uploadType: this.upload_type,
      brand: this.item.brand
    };
    this.cbuploader.call(this, param, (err, modifiedFile) => {
      if (err) return this.emit("error", err);
      that.modifiedFile = modifiedFile;
      that.uploadModified();
    });
  }
  uploadModified() {
    let that = this;
    console.log("Modified File", this.modifiedFile);

    if (!fs.existsSync(this.modifiedRemote)) {
      this.modifiedFile = this.localFile;
    }
    this.job.log(
      "UPLOADING SEAMLESS FILE TO " +
        that.item.brand.dir.processing +
        that.item.file.name
    );
    common.uploadFile(
      that.item.brand.ftp,
      that.modifiedFile,
      that.item.brand.dir.processing + that.item.file.name,
      function(err) {
        if (err)
          return that.emit("error", {
            file: that.item.brand.dir.processing + "/" + that.item.file.name,
            message:
              "Error in uploading seamless file to " +
              that.item.brand.dir.processing +
              that.item.file.name
          });
        console.log("in uploader 187");
        // that.localUploader();
        that.done();
      }
    );
  }
  done() {
    this.job.log("Moving file from processing to processed");
    var that = this;
    common.moveFile(
      that.item.brand.ftp,
      that.item.brand.dir.processing + "/" + that.item.file.name,
      that.item.brand.dir.processed + "/" + that.item.file.name,
      function(err) {
        if (err) {
          that.job.log("Error in moving processing to processed " + err);
          // that.emit('error',)
        } else {
          common.sendErrorEmail(
            that.queue,
            that.item,
            that.item.brand.dir.processing +
              that.item.file.name +
              " move to " +
              that.item.brand.dir.processed +
              that.item.file.name
          );
        }
        that.moveToBackup();
      }
    );
  }
  moveToBackup() {
    var that = this;
    console.log("Moving file to backup");

    this.job.log("MOVING FILE TO BACKUP DIR");
    common.uploadFile(
      that.item.brand.ftp,
      this.localFile,
      that.item.brand.dir.backup + "/" + that.item.file.name,
      function(err) {
        // fs.unlinkSync(that.localFile);
        // if (err) return that.emit("error", err);

        that.emit("done", { file: that.item.file });
      }
    );
  }
}
module.exports = Uploader;
