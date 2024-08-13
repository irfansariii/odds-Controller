import axios from "axios";
import express from "express"
import { authenticateUserRequest } from "./feederUtility";





export const sendOddsToPubsubRoute = async(req:express.Request, res:express.Response) => {

    try {

        let user = authenticateUserRequest(req);
    
        if (!req.body ||!req?.body?.odds) throw { message: 'Please Provide required fields', code: 400 }
    
    
        if(process.env.IsPubsubEnabled == 'true'){
          await service.sendToAll(JSON.stringify(req.body.odds));
        }else{
          
        const response = await axios.post(
          process.env.customServerUrl+"/insert-manual-odd",req.body
        );
    
        console.log(response.data)
        }
    
    
        // await insertOdds(req.body.odds.data[0],user.feederMemberId);
    
        res.status(200).json({ message: 'Odds inserted Successfully!', code: 201})
         
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