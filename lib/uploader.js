'use strict'


// concurrentProcess:{
//     brandManagerProcess: 4,
//     catalogBatchProcess:4,
//     emailProcess:2,
//   },


var uploader = function ({ queue, brands,numberOfProcess, fileFormats, cbuploader,cbemailfunction, filePath }) {
    // console.log(config);
    // console.log(filePath)
    
     
    Object.keys(brands[0].dir).forEach(function(keys){
        if(brands[0].dir[keys].split('/').pop()!='' ){
            brands[0].dir[keys] = brands[0].dir[keys] +'/'
        }
        
    })
    

    
    console.log(brands)
    var manager = require("../worker/manager");
    manager(queue, brands, fileFormats,numberOfProcess.brandManagerProcess);

    //inialize processor
    var processor = require("../worker/processor");
    processor(queue, cbuploader,filePath,numberOfProcess.catalogBatchProcess);

    var email = require("../worker/email");
    email(queue,cbemailfunction,numberOfProcess.emailProcess);

};


module.exports = uploader;
