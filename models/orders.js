var mongoose = require('mongoose');


var orderSchema = mongoose.Schema({
   user_id:
   {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required : true

   },
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
           type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
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
const Order = mongoose.model('Order', orderSchema);
module.exports.order= Order;