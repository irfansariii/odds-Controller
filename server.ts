import express from 'express';
import feederRouter from './ROUTES/feederRouter';


  const port = 5000;
  const app = express();
 
  app.use(express.json());
 
 
  app.get("/", (req, res) => {
      res.send("Hello World! is live!!");
      
  });
 
 
  app.get("/check", (req:express.Request, res:express.Response) => {
    res.status(200).send("<h1>Hello</h1>!");
  });
 
 
  // cron.schedule('* * * * * *', () => {
  //   console.log('Running a task every second');
  // });
 
 
  //router config
 
  app.use('/api',feederRouter)
 
 
  app.listen(port, () => {
    console.log(`Server is listening on port 5000`);
  });
   
