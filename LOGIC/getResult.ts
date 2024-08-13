import express from "express"
import { getResult } from "./feederUtility";



export const getResultRoute = async(req:express.Request,res:express.Response) => {

    try {

        if(!req.body.marketId) throw ({message:'Provide market Id!',code:400})
    
    
            const result = await getResult(req.body.marketId);
            
            res.status(200).json({data:result })
        
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