import express from "express"
import { updateFancyMarket } from "./feederUtility";



export const updateBookmakerFancyMarketRoute = async(req:express.Request,res:express.Response) => {


  try {

    const isTimerTriggerEnabled = process.env.IsTimerTriggerEnabled;

      if(isTimerTriggerEnabled == 'true'){
        await updateFancyMarket();
      }


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