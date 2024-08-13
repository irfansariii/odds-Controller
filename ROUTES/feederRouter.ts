import express from 'express';
import { feederloginRoute } from '../LOGIC/feeder-login';
import { getSportsRoute } from '../LOGIC/getSports';
import { getAllFeederMembersRoute } from '../LOGIC/getAllFeederMembers';
import { getCustomMarketForPanelRoute } from '../LOGIC/getCustomMarketForPanel';
import { getAssignedMarketsRoute } from '../LOGIC/getAssignedMarkets';
import { getResultForFeederPanelRoute } from '../LOGIC/getResultForFeederPanel';
import { getTournamentRoute } from '../LOGIC/getTournament';
import { getMatchesRoute } from '../LOGIC/getMatches';
import { getOddsHistoryRoute } from '../LOGIC/getOddsHistory';
import { deleteCustomMarketRoute } from '../LOGIC/deleteCustomMarket';
import { assignMarketToFeederRoute } from '../LOGIC/assignMarketToFeeder';
import { changeFeederAdminPasswordRoute } from '../LOGIC/changeFeederAdminPassword';
import { checkBetFairApiRoute } from '../LOGIC/checkBetFairApi';
import { createFeederMemberRoute } from '../LOGIC/createFeederMember';
import { deleteAssignedMarketRoute } from '../LOGIC/deleteAssignedMarket';
import { deleteMemberRoute } from '../LOGIC/deleteMember';
import { getAllMarketsRoute } from '../LOGIC/getAllMarkets';
import { getBetFairMarketsRoute } from '../LOGIC/getBetFairMarkets';
import { getBetsPlacedOnCustomMarketRoute } from '../LOGIC/getBetsPlacedOnCustomMarket';
import { getFeederByUserIdRoute } from '../LOGIC/getFeederByUserId';
import { getLastMarketRateRoute } from '../LOGIC/getLastMarketRate';
import { getMarketsWithUndecalerdResultRoute } from '../LOGIC/getMarketsWithUndecalerdResult';
import { getPubSubUrlRoute } from '../LOGIC/getPubSubUrl';
import { getReferenceMarketsRoute } from '../LOGIC/getReferenceMarkets';
import { getResultRoute } from '../LOGIC/getResult';
import { insertOddsRoute } from '../LOGIC/insertOdds';
import { insertResultRoute } from '../LOGIC/insertResult';


const feederRouter:express.Router = express.Router();

feederRouter.post('/feeder-login',feederloginRoute)
feederRouter.get('/getSports', getSportsRoute)
feederRouter.get('/getAllFeederMembers',getAllFeederMembersRoute)
feederRouter.get('/getCustomMarketForPanel', getCustomMarketForPanelRoute)   //doubt get or post
feederRouter.post('/getAssignedMarkets',getAssignedMarketsRoute )      //doubt get or post
feederRouter.post('/getResultForFeederPanel', getResultForFeederPanelRoute)     
feederRouter.post('/getTournament', getTournamentRoute) 
feederRouter.post('/getMatches', getMatchesRoute) 
feederRouter.post('/getOddsHistory', getOddsHistoryRoute) 
feederRouter.post('/deleteCustomMarket', deleteCustomMarketRoute)        
feederRouter.post('/deleteCustomMarket', assignMarketToFeederRoute)       
feederRouter.post('/deleteCustomMarket', assignMarketToFeederRoute)      
feederRouter.post('/changeFeederAdminPassword', changeFeederAdminPasswordRoute) 
feederRouter.get('/checkBetFairApi', checkBetFairApiRoute)       
feederRouter.post('/createFeederMember', createFeederMemberRoute)           
feederRouter.post('/deleteAssignedMarket', deleteAssignedMarketRoute)      
feederRouter.post('/deleteMember', deleteMemberRoute)      
feederRouter.post('/getAllMarkets', getAllMarketsRoute)        
feederRouter.post('/getBetFairMarkets', getBetFairMarketsRoute)             
feederRouter.post('/getBetsPlacedOnCustomMarket', getBetsPlacedOnCustomMarketRoute)             
feederRouter.post('/getFeederByUserId', getFeederByUserIdRoute) 
feederRouter.post('/getLastMarketRate', getLastMarketRateRoute) 
feederRouter.post('/getMarketsWithUndecalerdResult', getMarketsWithUndecalerdResultRoute)        
feederRouter.post('/getPubSubUrl', getPubSubUrlRoute)          
feederRouter.post('/getReferenceMarkets', getReferenceMarketsRoute)
feederRouter.post('/getResult', getResultRoute)              
feederRouter.post('/insertOddsRoute', insertOddsRoute)           
feederRouter.post('/insertResult', insertResultRoute)        
feederRouter.post('/saveCustomMarketWithManualEntry', saveCustomMarketWithManualEntryRoute) 
export default feederRouter
