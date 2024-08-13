import express from "express"  
import { getFeederByFeederByMemberId, updateFeederMember } from "./feederUtility";



export const updateFeederMemberRoute = async(req:express.Request,res:express.Response) => {

    try {

        if(!req.body.feederMemberId || !req.body.feederMemberUsername || !req.body.feederMemberPassword) throw {message:"Required Fields missing",code:400}
        
        const member = await getFeederByFeederByMemberId(req.body.feederMemberId);
    
        if(!member) throw {message:"Member does not exists!",code:400}
    
        await updateFeederMember(req.body.feederMemberId,req.body.feederMemberUsername,req.body.feederMemberPassword)
    
        res.status(200).json({ message: 'Member updated successfully!', code: 201 })
        
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