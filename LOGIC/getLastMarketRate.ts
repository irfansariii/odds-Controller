import express from "express"
import { getLastMarketRate } from "./feederUtility";




export const getLastMarketRateRoute = async(req:express.Request,res:express.Response) => {

     
  try {

    if(!req.body.marketId) throw ({message:'Provide market id!',code:400})

        const lastMarketObj = await getLastMarketRate(req.body.marketId);

        res.status(200).json({ lastMarketObj })
      
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