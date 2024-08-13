import express from "express"
import { authenticateAdminRequest, getBookmakerMarketWithCentralIdCentralId } from "./feederUtility";




export const checkBetFairApiRoute = async(req:express.Request,res:express.Response) => {

    try {

        const admin: any = authenticateAdminRequest(req);
    
        await getBookmakerMarketWithCentralIdCentralId(4,11729982,32701023);
    
        res.status(200).json({ message: 'AP CHECKED', code: 201 })
        
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