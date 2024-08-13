import express from "express"
import { assignMarketToFeeder, authenticateAdminRequest } from "./feederUtility";




export const assignMarketToFeederRoute = async(req:express.Request,res:express.Response) => {

    try {

        const admin: any = authenticateAdminRequest(req);
    
        if(!req.body.feederMemberId || !req.body.marketId) throw {message:"Required Fields missing",code:400}
    
        let payload = {
            feederMemberId:req.body.feederMemberId,
            marketId:req.body.marketId,
            marketTypeId:req.body.marketTypeId
        }
        
        await assignMarketToFeeder(payload)
    
        res.status(200).json({ message: 'Member assigned successfully!', code: 201 })
        
        
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