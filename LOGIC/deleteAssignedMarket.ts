import express from "express"
import { authenticateAdminRequest, deleteMarketAssignment } from "./feederUtility";




export const deleteAssignedMarketRoute = async(req:express.Request,res:express.Response) => {

    try {

        const admin: any = authenticateAdminRequest(req);
    
        if (!req?.body?.feederMarketAssignmentId) throw { message: 'Please Provide required fields', code: 400 }
    
        await deleteMarketAssignment(req?.body?.feederMarketAssignmentId);
    
        res.status(200).json({ message: 'Assignment Deleted Successfully!', code: 201})
         
      }  catch (err:any) {
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