import express from "express"
import { authenticateAdminRequest, deleteFeeder } from "./feederUtility";




export const deleteMemberRoute = async(req:express.Request,res:express.Response) => {

    try {

        const admin: any = authenticateAdminRequest(req);
        
        if(!req.body.feederMemberId) throw {message:"Required Fields missing",code:400}
        
        await deleteFeeder(req.body.feederMemberId)
    
        res.status(200).json({ message: 'Member deleted successfully!', code: 201 })
       
      } catch (err:any) {
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