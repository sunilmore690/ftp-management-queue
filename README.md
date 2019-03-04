# uploader-queue

Initialize uploader queue with kue
```
const kue = require('kue');
let queue = kue.createQueue()

/*Add your code snipped in sendEmail function using any email client*/
const sendEmail = (job, ctx, done) => {
   let data = job.data;
   /*
    data = {
     item:<fileName with filePath>
     err:<errorMessage>,
     title:<>
    }
   
   */
    setTimeout(function(){
        done();
    },1000)
};

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
    emailProcess: 2 // concurrency for sending email
  },
  items: [
    {
      id: "1",
      name: "Brand1",
      priority: "normal",//normal,high,medium
      // this used only when file format is xml to determine from which parent tag read the data
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
  cbemailfunction: sendEmail,
  customCallback: processFile,
  filePath: __dirname
};

#initialize uploader queue
uploader(options)
```


### How Uploader queue Management works?

1. We’ve one scheduler , which will select one brand in sequence from list and add this brand to brandmanagerqueue

2.  For now, we’ve set only one processor for brandmanagerqueue . It’ll connect to ftp server &  list down all the Catalog Files from  upload dir for that brand and add these files to another queue 
catalogbatchqeue and before adding these file to queue ,first we move the file from upload dir to enqueued dir

3. While adding file to the queue we can give priority to that file, So it’ll pick file to process according to priority. 

4.  For now, we’ve set 4 processor for catalogbatchqeue means 4 file will process parallely.

5. In catalogbatchqeue processor perform following things

        1. Move file from enqueued to processing
        2. Apply Seamless Processing to that file
        3. Pass this seamless file to Catalog Bash Script 
            
        4. After successfully  run Catalog Batch File , move seamless to processed dir and move the actual file to backup dir

   
