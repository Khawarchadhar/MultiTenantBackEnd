var mongoose = require("mongoose");

var tenantSchema = mongoose.Schema({
  Admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  Tenant: [
    {
      Tenant_name: {
        type: String,
        required: true,
      },
      Tenant_id: String,
    },
  ],
});

const Tenant = mongoose.model("Tenant", tenantSchema);
module.exports.tenant = Tenant;
