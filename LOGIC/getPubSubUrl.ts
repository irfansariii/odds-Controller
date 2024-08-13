import express from "express"
import { authenticateUserRequest, getPubsubUrl } from "./feederUtility";




export const getPubSubUrlRoute = async(req:express.Request,res:express.Response) => {

    try {

        // let service = new WebPubSubServiceClient(process.env.pubSubConnStr, process.env.hubName)
        // let token = await service.getClientAccessToken({expirationTimeInMinutes:1440})
    
       authenticateUserRequest(req);
    
        const response = await getPubsubUrl(req);
    
        res.status(200).json(response)

       
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