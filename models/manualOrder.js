var mongoose = require('mongoose');
var manualOrderSchema = mongoose.Schema({
  name: String,
  contact:String,
   address:
   {
       type: String,
       required:true
   },
   totalAmount:{
       type: Number,
       required: true
   },
   items:[
  {
      product: {
           type:String,
            required : true
      },
      quantity:{
          type: Number,
          required: true
      }
    }
   ],
   payment:
   {
       type:String,
       required:true
   },
   OrderStatus:
   {
            type:String,
            default:'pending'
   },
   tenant_id:String

});
const ManualOrder = mongoose.model('ManualOrder', manualOrderSchema);
module.exports.manualOrder= ManualOrder;