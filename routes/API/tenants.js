var express = require("express");
var router = express.Router();
var { tenant } = require("../../models/tenants");
const { user } = require("../../models/users");

/* Create Tenant */
// router.post("/addTenant/:id", async function (req, res) {
//     var User = await tenant.findOne({ user: req.params.id });
//     if (User) {
//         const Tenants = req.body.Tenant.Tenant_id;
//         const ID = User.Tenant.find((t) => t.Tenant_id == Tenants);
//     if(ID) return res.status(400).send('Tenant Id already exists')
//         tenant.findOneAndUpdate(
//           { user: req.params.id },
//           { $push: { Tenant: req.body.Tenant} },
//           { new: true },
//           (err, doc) => {
//             if (err) {
//               console.log("Something wrong when updating data!");
//             }
//           }
//         );
//         return res.send("Tenant updated successfully");
//       }
//     else {
//       let Tenant = new tenant();
//       (Tenant.user = req.params.id), (Tenant.Tenant = [req.body.Tenant]);

//       await Tenant.save();
//       return res.json(Tenant);
//     }
//   });

router.post("/addTenant/:id", async function (req, res) {
  var Admin = await tenant.findOne({ Admin: req.params.id });
  if (Admin) {
    const Tenants = req.body.Tenant.Tenant_id;
    const ID = Admin.Tenant.find((t) => t.Tenant_id == Tenants);
    if (ID) return res.status(400).send("Tenant Id already exists");
    tenant.findOneAndUpdate(
      { Admin: req.params.id },
      { $push: { Tenant: req.body.Tenant } },
      { new: true },
      (err, doc) => {
        if (err) {
          console.log("Something wrong when updating data!");
        }
      }
    );
    return res.send("Tenant updated successfully");
  } else {
    let Tenant = new tenant();
    (Tenant.Admin = req.params.id), (Tenant.Tenant = [req.body.Tenant]);

    await Tenant.save();
    return res.json(Tenant);
  }
});

/* Get All Tenants w.r.t admin*/
router.get("/Admin/:id", async function (req, res) {
  let Tenant = await tenant.find({ Admin: req.params.id }).populate("Admin");
  return res.send(Tenant);
});

/* Get Single Tenant */
router.get("/:id", async function (req, res) {
  try {
    let Tenant = await tenant.findOne({ user: req.params.id }).populate("user");
    if (!Tenant)
      return res.status(400).send("Tenant with given Id does not exist");
    console.log(Tenant);
    return res.send(Tenant);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* Delete single Store of a tenant */

/* Delete tenant of specific admin */
router.delete("/:id/:ID", async function (req, res) {
  try {
    var User = await tenant.findOne({ Admin: req.params.id });
    if (!User) return res.status(400).send("User does not exist");

    tenant.findOneAndUpdate(
      { Admin: req.params.id },
      {
        $pull: {
          Tenant: { ...req.body.Tenant, _id: req.params.ID },
        },
      },
      { new: true },
      (err, doc) => {
        if (err) {
          return res.status(500).send("Something wrong when updating data!");
        }
        return res.send("Tenant Stores updated successfully");
      }
    );
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

// router.delete("/:id/:ID", async function (req, res) {
//   try {
//     var User = await tenant.findOne({ user: req.params.id });
//     if (!User) return res.status(400).send("User does not exist");

//     tenant.findOneAndUpdate(
//       { user: req.params.id },
//       {
//         $pull: {
//           Tenant: { ...req.body.Tenant, _id: req.params.ID },
//         },
//       },
//       { new: true },
//       (err, doc) => {
//         if (err) {
//           return res.status(500).send("Something wrong when updating data!");
//         }
//         return res.send("Tenant Stores updated successfully");
//       }
//     );
//   } catch (err) {
//     return res.status(400).send("Invalid ID");
//   }
// });

/* Delete tenant*/
router.delete("/:id", async function (req, res) {
  try {
    let Product = await tenant.findByIdAndDelete(req.params.id);
    if (!Product)
      return res.status(400).send("Tenant with given Id does not exists");
    return res.send(Product);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});
module.exports = router;
