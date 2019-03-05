


module.exports = function (queue, cbemailfunction,numberOfProcess) {

  queue.process("emailqueue", numberOfProcess, cbemailfunction);

}





  //  var emailCustomFunction = async function (job, ctx, done) {
  //   job.log("Sending Email");

  //   let data = job.data;
  //   var requestBody ={};
  //   const brand = data.item.brand;
  //   const file = data.item.file.name
  //   console.log("In send email function....")
  //   console.log(data.err)
  //   console.log(JSON.stringify(data.err));
  //   const err = typeof data.err == 'object' ? data.err : data.err;
  //   const comp_id = brand.optId;

  //   //  let url = config.opt.endpoint + '/optportal/services/sendBatchEmail.json';
  //   let url = 'https://optstaging.optcentral.com/optportal/services/sendBatchEmail.json';


  //   if(err.indexOf('move to')>-1){
  //    requestBody = {
  //       url: url,
  //       method: 'POST',
  //       json: true,
  //       body: {
  //         comp_id: '('+brand+')' + comp_id,
  //         body: '<html><b> '+err+' </b><br></br><p><b>company name</b>: ' + brand.name + ' (' + comp_id + ')<br></br> <b>file name</b>: ' + file + '<br></br></p></html>',
  //         subject:  "Uploader Queue",
  //       }
  //     }    
  //   }
  //   else{
  //     requestBody={
  //       url: url,
  //       method: 'POST',
  //       json: true,
  //       body: {
  //         comp_id: comp_id,
  //         body: '<html><b>There is some issues in file uploadig, following are details</b><br></br> <p><b>company name</b>: ' + brand.name + ' (' + comp_id + ')<br></br> <b>file name</b>: ' + file + '<br></br><b>error</b>:' + err + '<br></br></p></html>',
  //         subject: "Catalog Batch Run Issue for CompanyId " + comp_id
  //       }
  //     }

  //   }

  //   request(requestBody, (error, response, body) => {
  //     if (error) {
  //       done(error);
  //     } else {
  //       done(null, response)
  //     }
  //   });
  // }

