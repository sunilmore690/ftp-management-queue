
# ftp-management-queue

File Queue Management for FTP/SFTP Server
```
const kue = require('kue');
let queue = kue.createQueue()
/*Add your processing file code snippet according to your requirement*/
const processFile = (params, cb) => {

  /*
   params = {
    fileName:<>,
    filePath:<>,
   }
  */
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
  queue,
  fileFormats: [".csv"], //.csv,.xml,.xlsx
  numberOfProcess: {
    itemsManagerProcess: 1,//concurrency to monitor brand ftp server at a time for newly uploaded file
    fileBatchProcess: 1, //number of file process at a time
  },
  processNames:{
     manager:'manager-queue',//queue name for manager process
     processor:'processor-queue',//queue name for file processor process
  },
  items: [
    {
      id: "1",
      name: "Brand1",
      priority: "normal",//normal,high,medium
      // this used only when file format is xml to determine from which parent tag read the data
      type:'ftp',//ftp/sftp
      ftp: {
        host: "localhost",
        port: 21,
        user: "user",
        password: "password",
      },
      dir: {
        upload: "/path/to/upload/dir",
        enqueued: "/path/to/enqueued/dir",
        processing: "/path/to/processing/dir",
        error: "/path/to/error/dir",
        processed: "/path/to/processed/dir",
        backup: "/path/to/backup/dir"
      }
    }
  ],
  customCallback: processFile,
  filePath: __dirname
};

#initialize uploader queue
const FtpManagementQueue = require('ftp-management-queue')
FtpManagementQueue(options)
```


### How File Queue Management works?

1. *Manager Queue* - Monitor for new files in upload dir from multiple FTP server which we've defined in **items** and add those file file processor Queue, while doing it he'll move this file to enqueued dir
    
    - Move file from *upload* dir to *enqueued* dir
    
2.  *Processor Queue* - Process the file using **customCallback** function given by user.
      
      - Move file from enqueued to processing dir
      - Execute  **customCallback** function on file
      - Once done move this file to *processed* dir , also move the original file to *backup* dir
      - If you pass updated file path to callback function then updated file will go to processed dir and original file will go to backup dir
3. We can define , how many **Manager Queue** and **Processor  Queue** can parallely run in options

  ``` 
  numberOfProcess: {
    itemsManagerProcess: 1,//concurrency to monitor brand ftp server at a time for newly uploaded file
    fileBatchProcess: 1, //number of file process at a time
    emailProcess: 2 // concurrency for sending email
  }
  ```
  