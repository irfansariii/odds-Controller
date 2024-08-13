import express from "express"
import { authenticateAdminRequest, changePassword, getFeederByFeederByMemberId } from "./feederUtility";



const bcrypt = require('bcryptjs')


export const changeFeederAdminPasswordRoute = async(req:express.Request,res:express.Response) => {

    try {

        let admin = authenticateAdminRequest(req);

        if(admin.feederRoleId!=1) throw {message:'Not Allowed!',code:400}

        if(!req.body.password) throw {message:'Provide required fields!',status:400}


        const member = await getFeederByFeederByMemberId(admin.feederMemberId);

      if (!member) {
        throw { message: 'Member does not exists', code: 404 }
      }
       
       const hash = await bcrypt.hashSync(req.body.password, 10);

       await changePassword(admin.feederMemberId, hash);

       res.status(200).json({ message: 'Password Updated Successfully' })
       
  }catch (err:any) {
    if (err.code && err.code > 1) {
      res.status(err.code).json({
        statusCode: err.code, message: err.message ? err.message : err
      })
    } else {
      res.status(200).json({
        statusCode: err.code ? err.code : 500, message: err.message ? err.message : err
      })
    }
  }
}