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




export default feederRouter