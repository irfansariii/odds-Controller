import { DB_NAME, DB_PASSWORD, DB_SERVER, DB_USER, jwtkey } from "../CONFIG/environment"
import axios from "axios"

var bcrypt = require('bcryptjs')
export const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  server: DB_SERVER,
  connectionTimeout: 30000,
  requestTimeout: 60000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  authentication: {
    type: 'default'
  },
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
}

const jwt = require('jsonwebtoken')

const sql = require('mssql')



export const getFeederByFeederUsername = async (feederMemberUsername) => {
  try {
    let pool = await sql.connect(sqlConfig)
    let query = await pool
      .request()
      .input('feederMemberUsername', feederMemberUsername)
      .query(`SELECT feederMemberId,feederMemberUsername,feederMemberPassword,feederRoleId FROM feederMembers WHERE [feederMemberUsername] = @feederMemberUsername`)

    const feederMember = query.recordset[0]

    return Promise.resolve(feederMember)

  } catch (error) {
    console.error('rejecting getFeederByFeederUsername')
    console.error(error)
    throw (error)
  }
}
// NEED TO DISCUSS

export const authenticateAdminRequest = (req: any): any => {

  let token: string | null = null;

  if (!req.headers.authorization) {
    throw { message: "Login Required !", code: 401 }
  }

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    throw { message: "Invalid Token", code: 401 };
  }

  try {
    jwt.verify(token, Buffer.from(jwtkey, 'base64'));
    // console.log(isTokenVerified);
    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    // console.log(decodedToken)

    if (decodedToken.user.feederRoleId != 1) throw { message: 'User Not Authorized!', code: 400 }

    return decodedToken.user
  } catch (err) {
    console.log("invalid token")
    throw { message: "Invaid Token", code: 401 }
  }

}

export const getDbSports = async () => {
  try {

    let pool = await sql.connect(sqlConfig)
    let sportQuery = await pool
      .request()
      .query(`select * from betfairSports`);

    let sportList = sportQuery.recordset;

    return Promise.resolve(sportList)

  } catch (error) {
    throw error;
  }
}

export const getAllFeeder = async () => {
  try {
    let pool = await sql.connect(sqlConfig)
    let query = await pool
      .request()
      .query(`SELECT feederMemberId,feederMemberUsername,feederMemberPassword,feederRoleId,createdDateTime FROM feederMembers WHERE feederRoleId=2`)

    const feederMember = query.recordset;

    return Promise.resolve(feederMember)

  } catch (error) {
    console.error('rejecting getAllFeeder')
    console.error(error)
    throw (error)
  }
}
export const getCustomMarketForFeederPanel = async (matchId, typeId, marketId, centralId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    const marketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .input('marketTypeId', typeId)
      .input('marketId', marketId)
      .input('refCentralId', centralId)
      .query(`select marketId,refMatchId,refMatchName,refTournamentId,refTournamentName,createDateTime,
          refSportId,refSportName,marketName,marketTime,marketType,runners,marketTypeId,refCentralId,
          lastMarketRate,isCustomMarket,customMinBet,customMaxBet,customDelay,customMarketSize, sequenceNo from 
          customMarkets
          WHERE (@marketTypeId IS NULL OR marketTypeId = @marketTypeId)
          AND isResultDeclared=0
          AND (@marketId IS NULL OR marketId = @marketId)
          AND (@refCentralId IS NULL OR refCentralId = @refCentralId) 
          AND (@refMatchId IS NULL OR refMatchId = @refMatchId) ORDER BY customMarketsId desc`)

    const marketList = marketQuery.recordset;

    for (let market of marketList) {
      market.runners = JSON.parse(market.runners)
    }

    return Promise.resolve(marketList);

  } catch (error) {
    console.error('rejecting getCustomMarketForFeederPanel.')
    console.error(error)
    throw (error)
  }
}

export const getResultForFeederPanel = async (resultObj) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let resultQuery = await pool
      .request()
      .input('marketId', resultObj.marketId)
      .input('matchId', resultObj.matchId)
      .input('tournamentId', resultObj.tournamentId)
      .query(`select selectionId,selectionName,matchName,sportName,marketName,tournamentName,createdDateTime from resultMaster where 
      (@marketId IS NULL OR marketId = @marketId)
      AND (@matchId IS NULL OR matchId = @matchId)
      AND (@tournamentId IS NULL OR tournamentId = @tournamentId) `);

    const result = resultQuery.recordset;

    return Promise.resolve(result)

  } catch (error) {
    return error
  }
}
export const getDbTournaments = async (refSportId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let tourQuery = await pool
      .request()
      .input('refSportId', refSportId)
      .query(`select * from betfairTournaments where refSportId=@refSportId`);

    let tourList = tourQuery.recordset;

    return Promise.resolve(tourList)

  } catch (error) {
    throw error;
  }
}
export const getDbMatches = async (refTournamentId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let matchQuery = await pool
      .request()
      .input('refTournamentId', refTournamentId)
      .query(`select * from betfairMatches where refTournamentId=@refTournamentId`);

    let matchList = matchQuery.recordset;

    return Promise.resolve(matchList)

  } catch (error) {
    throw error;
  }
}
export const getAssignedMarkets = async (body) => {
  try {

    let pool = await sql.connect(sqlConfig)
    const assignQuery = await pool
      .request()
      .input('marketId', body.marketId)
      .input('refMatchId', body.refMatchId)
      .input('refFeederMemberId', body.refFeederMemberId)
      .query(`select fma.feederMarketAssignmentId, fma.refMarketId,fma.refFeederMemberId,fma.marketTypeId,fm.feederMemberUsername,
    cm.refMatchName,cm.marketName,fma.createdDateTime,cm.refMatchId,cm.refCentralId
    from feederMarketAssignment fma INNER JOIN feederMembers fm ON fma.refFeederMemberId=fm.feederMemberId
    INNER JOIN customMarkets cm ON cm.marketId=fma.refMarketId
    WHERE (@refFeederMemberId IS NULL OR refFeederMemberId = @refFeederMemberId)
    AND cm.isResultDeclared=0
    AND (@marketId IS NULL OR fma.refMarketId = @marketId) 
    AND (@refMatchId IS NULL OR cm.refMatchId = @refMatchId); `);


    const assignedMarkets = assignQuery.recordset;

    return Promise.resolve(assignedMarkets);
  } catch (error) {
    throw error;
  }
}
export const getOdds = async (body) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let oddQuery = await pool
      .request()
      .input('bmi', body.marketId)
      .input('eid', body.matchId)
      .input('startDate', new Date(body.startDate).toISOString())
      .input('endDate', new Date(body.endDate).toISOString())
      .input('feederId', body.feederId)
      .query(`select bmi,ip,mi,ms,eid,rt,cm.createdDateTime,feederMemberUsername,marketName,matchName,ipAddress,runners from customOddsMaster cm INNER JOIN feederMembers fm
      ON cm.feederId = fm.feederMemberId
      where 
      (@bmi IS NULL OR bmi = @bmi)
      AND (@eid IS NULL OR eid = @eid)
      AND (@feederId IS NULL OR feederId = @feederId)
      AND cm.createdDateTime BETWEEN @startDate AND @endDate
      order by customOddsMasterId desc`)

    const oddsList = oddQuery.recordset;

    for (let odd of oddsList) {
      odd.rt = JSON.parse(odd.rt)
      odd.runners = JSON.parse(odd.runners)
    }

    return Promise.resolve(oddsList)

  } catch (error) {
    throw error
  }
}


export const deleteCustomMarket = async (marketId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('marketId', marketId)
      .query(`delete from customMarkets where marketId=@marketId and isCustomMarket=1`);

    await pool
      .request()
      .input('refMarketId', marketId)
      .query(`delete from feederMarketAssignment where refMarketId=@refMarketId`);

    return Promise.resolve(true);

  } catch (error) {
    console.error('rejecting deleteCustomMarket.')
    console.error(error)
    throw (error)
  }
}



export const deleteCustomMarketInPanel = async (marketId) => {
  try {

    await axios.post(
      "https://web-apis.azurewebsites.net/api/deleteCustomMarket", {
      marketId: marketId
    }
    );

    return Promise.resolve(true);

  } catch (error) {
    console.error('rejecting deleteCustomMarket.')
    console.error(error)
    throw (error)
  }
}
export const assignMarketToFeeder = async (payload) => {
  try {

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMemberId', payload.feederMemberId)
      .input('refMarketId', payload.marketId)
      .input('marketTypeId', payload.marketTypeId)
      .query(`INSERT INTO feederMarketAssignment ([refMarketId],[refFeederMemberId],[marketTypeId]) VALUES (@refMarketId,@feederMemberId,@marketTypeId)`);

    return Promise.resolve(true);

  } catch (error) {
    throw error;
  }
}
export const getFeederByFeederByMemberId = async (feederMemberId) => {
  try {
    let pool = await sql.connect(sqlConfig)
    let query = await pool
      .request()
      .input('feederMemberId', feederMemberId)
      .query(`SELECT feederMemberId,feederMemberUsername,feederMemberPassword,feederRoleId FROM feederMembers WHERE [feederMemberId] = @feederMemberId`)

    const feederMember = query.recordset[0]

    return Promise.resolve(feederMember)

  } catch (error) {
    console.error('rejecting getFeederByFeederByMemberId')
    console.error(error)
    throw (error)
  }
}
export const changePassword = async (memberId, password) => {
  try {

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMemberId', memberId)
      .input('feederMemberPassword', password)
      .query(`update feederMembers SET [feederMemberPassword]=@feederMemberPassword where feederMemberId=@feederMemberId`);

    return Promise.resolve(true);

  } catch (error) {
    console.error('rejecting deleteFeeder.')
    console.error(error)
    throw (error)
  }
}

export const getBookmakerMarketWithCentralIdCentralId = async (sportId, tourId, matchId) => {
  try {

    const market: any = await getBookmakerMarket(matchId, 12);

    const response = await axios.post(
      "https://central3.satsport248.com/api/import_bookmaker_market",
      {
        "access_token": await getBetfairToken(),
        "sport_id": sportId,
        "tournament_id": tourId,
        "match_id": matchId,
        "market_ids": market.marketId
      }
    );

    const centralRes = response.data;

    if (centralRes) {
      market.refCentralId = centralRes.data[0].centralId;
    }

    console.log(market)

    return Promise.resolve(market)

  } catch (error) {
    throw error;
  }
}
export const getBookmakerMarket = async (matchId, typeId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    const marketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .input('marketTypeId', typeId)
      .query(`select marketId,refMatchId,refMatchName,refTournamentId,refTournamentName,createDate,
        refSportId,refSportName,marketName,matchTime,marketTime,marketType,runners,marketTypeId,
        lastMarketRate from 
        betfairMarkets where
        marketTypeId=@marketTypeId and refMatchId=@refMatchId AND marketName LIKE '%BOOKMAKER%'`)

    const market = marketQuery.recordset[0];

    if (!market) throw { message: 'Unable to find market!', code: 400 }

    market.runners = JSON.parse(market.runners)

    return Promise.resolve(market);

  } catch (error) {
    console.error('rejecting getBookmakerMarket.')
    console.error(error)
    throw (error)
  }
}
export const getBetfairToken = async () => {
  try {


    const response = await axios.post(
      "https://central3.satsport248.com/api/get_access_token",
      {
        agentcode: process.env.agent_code,
        secretkey: process.env.secret_key,
      }
    );

    const accessToken = response.data;

    return Promise.resolve(accessToken.token)

  } catch (err) {
    console.error('rejecting updateFancyMarket', err)
    throw err
  }
}
export const createFeederMember = async (feederMemberUsername, feederMemberPassword) => {
  try {

    const pwdHash = await bcrypt.hashSync(feederMemberPassword, 10);

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMemberUsername', feederMemberUsername)
      .input('feederMemberPassword', pwdHash)
      .input('feederRoleId', 2)
      .execute(`InsertOrUpdateFeederMember`)

  } catch (error) {
    console.error('rejecting createFeederMember')
    console.error(error)
    throw (error)
  }
}
export const deleteMarketAssignment = async (feederMarketAssignmentId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMarketAssignmentId', feederMarketAssignmentId)
      .query(`delete from feederMarketAssignment where feederMarketAssignmentId=@feederMarketAssignmentId`);

  } catch (error) {
    throw error;
  }
}
export const deleteFeeder = async (feederMemberId) => {
  try {
    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMemberId', feederMemberId)
      .query(`delete from feederMembers where feederMemberId=@feederMemberId`);

    return Promise.resolve(true);

  } catch (error) {
    console.error('rejecting deleteFeeder.')
    console.error(error)
    throw (error)
  }
}
export const getBetfairrMarket = async (matchId, typeId, marketId, centralId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    const marketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .input('marketTypeId', typeId)
      .input('marketId', marketId)
      .input('refCentralId', centralId)
      .query(`select * from  betfairMarkets        
        WHERE (@marketTypeId IS NULL OR marketTypeId = @marketTypeId)
        AND (@marketId IS NULL OR marketId = @marketId)
        AND (@refCentralId IS NULL OR refCentralId = @refCentralId) 
        AND (@refMatchId IS NULL OR refMatchId = @refMatchId);`)

    const marketList = marketQuery.recordset;

    for (let market of marketList) {
      market.runners = JSON.parse(market.runners)
    }

    return Promise.resolve(marketList);

  } catch (error) {
    console.error('rejecting getBetfairrMarket.')
    console.error(error)
    throw (error)
  }
}
export const authenticateUserRequest = (req): any => {

  let token = null;
  if (!req.headers.authorization) {
    throw { message: "Login Required !", code: 401 }
  }

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  }

  try {
    jwt.verify(token, Buffer.from(jwtkey, 'base64'));
    // console.log(isTokenVerified);
    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    console.log(decodedToken)

    if (decodedToken.user.feederRoleId != 2) throw { message: 'User Not Authorized!', code: 400 }

    return decodedToken.user
  } catch (err) {
    console.log("invalid token")
    throw { message: "Invaid Token", code: 401 }
  }

}
export const getBetsPlacedOnCustomMarket = async (marketId) => {
  try {

    const response = await axios.post(
      "https://web-apis.azurewebsites.net/api/getBetsPlacedOnCustomMarkets", {
      marketId: marketId
    });

    let betList = response.data;

    return Promise.resolve(betList)

  } catch (error) {
    console.error('rejecting getBetsPlacedOnCustomMarket.')
    console.error(error)
    throw (error)
  }
}
export const getLastMarketRate = async (marketId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let oddQuery = await pool
      .request()
      .input('bmi', marketId)
      .query(`select bmi,ip,mi,ms,eid,rt from customOddsMaster where bmi=@bmi order by customOddsMasterId desc`)

    let lastOdd = null;

    if (oddQuery.recordset[0]) {
      lastOdd = oddQuery.recordset[0];
      lastOdd.rt = JSON.parse(lastOdd.rt)
    }

    return Promise.resolve(lastOdd)
  } catch (error) {
    throw error
  }
}
export const getDbMarkets = async (matchId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let marketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .query(`select * from betfairMarkets where refMatchId=@refMatchId`);

    let marketList = marketQuery.recordset;

    for (let mrkt of marketList) {
      mrkt.runners = JSON.parse(mrkt.runners)
    }

    return Promise.resolve(marketList)

  } catch (error) {
    throw error;
  }
}
export const getMarketWithUndeclaredResult = async (matchId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let marketQuery = await pool
      .request()
      .input('matchId', matchId)
      .query(`SELECT marketId,marketTypeId, marketName,runners
      FROM customMarkets 
      WHERE isResultDeclared=0 and refMatchId=@matchId`);

    const markets = marketQuery.recordset;

    for (let mrkt of markets) {
      mrkt.runners = JSON.parse(mrkt.runners)
    }

    return Promise.resolve(markets)

  } catch (error) {
    return error
  }
}
export const getPubsubUrl = async (req) => {
  try {

    // if(webSocket && webSocket.readyState === WebSocket.OPEN){
    //   return token
    // }else{
    //   token = await service.getClientAccessToken({expirationTimeInMinutes:1440})
    //   webSocket = new WebSocket(token.url);
    //   return token
    // }

    const headers = {
      'X-Client-Domain': req.headers['x-client-domain']
    };


    const pubsubUrl = await axios.get("https://web-apis.azurewebsites.net/api/pubsuburl", { headers });

    const resultUrl = pubsubUrl.data;

    return Promise.resolve(resultUrl);

  } catch (error) {
    console.log(error)
    return error
  }
}

export const getReferenceMarket = async (marketTypeId, marketId, matchId) => {
  try {

    let pool = await sql.connect(sqlConfig)

    let betFairMarkets = [];
    let customMarkets = [];

    if (marketTypeId == 12) {
      const betfairMarketQuery = await pool
        .request()
        .input('refMatchId', matchId)
        .query(`select marketId,refMatchId,refMatchName,refTournamentId,refTournamentName,createDate,refCentralId,
            refSportId,refSportName,marketName,matchTime,marketTime,marketType,runners,marketTypeId,
            lastMarketRate from betfairMarkets where
            refMatchId=@refMatchId 
            AND (marketName LIKE '%BOOKMAKER%' OR marketName LIKE '%MATCH ODDS%')`);

      betFairMarkets = betfairMarketQuery.recordset;

      for (let mrkt of betFairMarkets) {
        mrkt.runners = JSON.parse(mrkt.runners);

        for (let rnr of mrkt.runners) {
          rnr.batb = [];
          rnr.batl = [];
        }
      }
    }

    const customMarketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .input('marketId', marketId)
      .query(`select marketId,refMatchId,refMatchName,refTournamentId,refTournamentName,
            refSportId,refSportName,marketName,marketType,runners,marketTypeId,refCentralId,
            customMinBet,customMaxBet,customMarketSize,customDelay,
            lastMarketRate from customMarkets where
            refMatchId=@refMatchId and 
            marketId=@marketId and
            isResultDeclared=0
            `);

    customMarkets = customMarketQuery.recordset;

    for (let mrkt of customMarkets) {
      mrkt.runners = JSON.parse(mrkt.runners);
    }

    const lastMarkateQuery = await pool
      .request()
      .input('marketId', marketId)
      .query(`select * from customOddsMaster where bmi=@marketId order by customOddsMasterId desc`);

    const lastMrktRt = lastMarkateQuery.recordset;

    for (let lastRt of lastMrktRt) {
      lastRt.rt = JSON.parse(lastRt.rt)
    }

    if (lastMrktRt.length > 0) {
      let lastRateObj = lastMrktRt[0];

      for (let mrkt of customMarkets) {

        mrkt.inPlayStatus = lastRateObj?.ip;
        mrkt.appMarketStatus = lastRateObj?.ms;
        mrkt.isActive = lastRateObj?.ip;

        let rtObj = lastRateObj.rt;

        for (let rnr of mrkt.runners) {
          rnr.batb = []
          rnr.batl = []

          if (lastRateObj) {

            if (marketTypeId == 12) {

              //BOOKMAKER
              const layLastRateObj = rtObj.filter(
                (r) => r.ri == rnr.SelectionId && r.ib == false
              )

              const backLastRateObj = rtObj.filter(
                (r) => r.ri == rnr.SelectionId && r.ib == true
              )

              let horseBackLastRate = []
              let horseLayLastRate = [];

              for (let i = 0; i < backLastRateObj.length; i++) {
                let rate = Math.round(backLastRateObj[i].rt * 100 - 100);

                horseBackLastRate.push({
                  index: 1,
                  odds: rate,
                  tv: backLastRateObj[i].bv,
                  runnerStatus: backLastRateObj[i]?.pr,
                })
              }

              for (let i = 0; i < layLastRateObj.length; i++) {
                let rate = Math.round(layLastRateObj[i].rt * 100 - 100);
                horseLayLastRate.push({
                  index: 1,
                  odds: rate,
                  tv: layLastRateObj[i].bv,
                  runnerStatus: backLastRateObj[i]?.pr,
                })
              }

              rnr.batb = horseBackLastRate;
              rnr.batl = horseLayLastRate;
            }

            if (marketTypeId == 10) {
              //FANCY

              const layLastRateObj = rtObj.filter(
                (r) => r.ri == rnr.SelectionId && r.ib == false
              )

              const backLastRateObj = rtObj.filter(
                (r) => r.ri == rnr.SelectionId && r.ib == true
              )

              let horseBackLastRate = []
              let horseLayLastRate = [];

              for (let i = 0; i < backLastRateObj.length; i++) {
                let rate = Math.round(backLastRateObj[i].rt);

                horseBackLastRate.push({
                  index: 1,
                  odds: rate,
                  tv: backLastRateObj[i].bv,
                  runnerStatus: backLastRateObj[i]?.pr,
                })
              }

              for (let i = 0; i < layLastRateObj.length; i++) {
                let rate = Math.round(layLastRateObj[i].rt);
                horseLayLastRate.push({
                  index: 1,
                  odds: rate,
                  tv: layLastRateObj[i].bv,
                  runnerStatus: backLastRateObj[i]?.pr,
                })
              }

              rnr.batb = horseBackLastRate;
              rnr.batl = horseLayLastRate;
            }
          }
        }
      }

    }

    return Promise.resolve({ betFairMarkets, customMarkets });

  } catch (error) {
    console.error('rejecting getReferenceMarket.')
    console.error(error)
    throw (error)
  }
}
export const getResult = async(marketIds)=>{
  try{

    console.log("======market ids=-==========")
    console.log(marketIds);


    const marketIdList: string = marketIds;
    const values: string[] = marketIdList.split(',');
    console.log(values);
    
    let marketToCheck = values.map((mrkt) => `'${mrkt}'`).join(',');

    let pool = await sql.connect(sqlConfig)
    let resultQuery =  await pool
      .request()
      .query(`select * from resultMaster where marketId IN (${marketToCheck})`);
    
    const result = resultQuery.recordset;

    console.log("=============result")
    console.log(result)

    let resultArr = [];

    for(let res of result){
      resultArr.push({Result:res.selectionId,sourceMarketID:res.marketId})
    }

    return Promise.resolve(resultArr)

  }catch(error){
    return error
  }
}

export const insertOdds = async(body,feederId)=>{
  try{

    const market = await getCustomMarketForFeederPanel(null,null,body.bmi,null);

    let marketName = null;
    let matchName = null;
    let runners = null

    if(market.length>0){
      marketName = market[0].marketName;
      matchName = market[0].refMatchName;
      runners = JSON.stringify(market[0].runners);
    }

    let pool = await sql.connect(sqlConfig)
      await pool
      .request()
      .input('bmi', body.bmi)
      .input('ip', body.ip)
      .input('mi', body.mi)
      .input('ms', body.ms)
      .input('eid', body.eid)
      .input('rt', JSON.stringify(body.rt))
      .input('feederId',feederId)
      .input('marketName', marketName)
      .input('matchName',matchName)
      .input('ipAddress',body.ipAddress)
      .input('runners',runners)
      .query(`INSERT INTO customOddsMaster 
        ([bmi],[ip],[mi],[ms],[eid],[rt],[feederId],[marketName],[matchName],[ipAddress],[runners]) VALUES 
        (@bmi,@ip,@mi,@ms,@eid,@rt,@feederId,@marketName,@matchName,@ipAddress,@runners)`)

  }catch(error){
    throw error
  }
}
export const insertResult = async(body,market)=>{
  try{

    console.log(market)

    let pool = await sql.connect(sqlConfig)
      await pool
      .request()
      .input('marketId', body.marketId)
      .input('selectionId', body.selectionId)
      .input('selectionName', body.selectionName)
      .input('matchId', market.refMatchId)
      .input('matchName', market.refMatchName)
      .input('sportId', market.refSportId)
      .input('sportName', market.refSportName)
      .input('tournamentId', market.refTournamentId)
      .input('tournamentName', market.refTournamentName)
      .input('marketName', market.marketName)
      
      .query(`INSERT INTO resultMaster 
        ([marketId],[selectionId],[selectionName],[matchId],[matchName],[sportId],[sportName],[tournamentId],[tournamentName],[marketName]) VALUES 
        (@marketId,@selectionId,@selectionName,@matchId,@matchName,@sportId,@sportName,@tournamentId,@tournamentName,@marketName)`)


      await pool
      .request()
      .input('marketId', body.marketId)
      .query(`UPDATE customMarkets SET isResultDeclared=1 where marketId=@marketId`)


        // await declareResultInPanel(body.marketId);
  
  return Promise.resolve(true)

  }catch(error){
    throw error
  }
}
export const triggerAdminPubSub = async(message)=>{
  
  try{
    let service = new WebPubSubServiceClient(process.env.userAdminPubSubConnStr, process.env.userAdminHub)
    await service.sendToAll(message);
  }catch(error){
    console.log("error in triggerpubsub occured")
  }
}
