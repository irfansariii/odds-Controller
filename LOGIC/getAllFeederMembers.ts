import express from "express"
import { authenticateAdminRequest, getAllFeeder } from "./feederUtility";



export const getAllFeederMembersRoute = async(req:express.Request,res:express.Response) => {

    try {
        
        const admin: any = authenticateAdminRequest(req);

        let feederList = await getAllFeeder();
    
        res.status(200).json({feederList:feederList})
       
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