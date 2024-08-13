import express from "express"
import { updateAllMarkets } from "./feederUtility";



export const updateMarketDataRoute = async(req:express.Request,res:express.Response) => {

    try {

        if(!req.body.sportsData) throw({message:'Sports data not present',code:400})
    
        await updateAllMarkets(req.body.sportsData);
    
        res.status(200).json({ message: 'Markets updated successfully!', code: 201 })
       
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