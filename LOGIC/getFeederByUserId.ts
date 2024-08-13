import express from "express"
import { authenticateAdminRequest, getFeederByFeederByMemberId } from "./feederUtility";



export const getFeederByUserIdRoute = async(req:express.Request,res:express.Response) => {

    try {
        
        if(!req.body.feederMemberId) throw {message:'Required fields missing!',code:400}

        const admin: any = authenticateAdminRequest(req);

        let feederList = await getFeederByFeederByMemberId(req.body.feederMemberId);
    
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