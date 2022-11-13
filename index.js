const express=require('express')
const app=express();
const corsModule=require('cors')
const moment=require('moment')
const userModel=require('./database/models/user')
const alarmModel=require('./database/models/alarm')
require('dotenv').config()
require('./database/index')
const PORT=process.env.PORT 
const server=require('http').createServer(app)

const io = require("socket.io")(server, {
	cors: {
	  origin: "*",
	  credentials:true,   
	  methods: ["GET", "POST"]
	}
  });

app.use(corsModule())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("server is Up")
})

//socket-----------
io.on('connection',(socket)=>{
    socket.on('user join',(userId)=>{
      console.log("Got it",userId)
      socket.join(userId);

      alarmModel.find( {alarmId:userId} )
	  	.then(function(data)
      {
		     for(let time of data)
         {
            const alarmDateTime=new Date(time.alarmTime);
            const currentDateTime=new Date();
            const timer=alarmDateTime-currentDateTime
            
            if(timer>0)
            {
              console.log("timer",timer)
              setTimeout(() => {
              const msg="Alarm Reached "
              io.sockets.in(userId).emit('reminder',msg);
            }, timer); 
            }
          
            // const dayDifference=alarmDateTime.getDate()-currentDateTime.getDate()
            // const monthDifference=alarmDateTime.getMonth()-currentDateTime.getMonth()
            // const yearDifference=alarmDateTime.getFullYear()-currentDateTime.getFullYear()
            // const hourDifference=(alarmDateTime.getHours()-currentDateTime.getHours())*(60*1000*60)
            // const minuteDifference=(alarmDateTime.getMinutes()-currentDateTime.getMinutes())*(60*1000)
            // const secondDifference=alarmDateTime.getSeconds()-currentDateTime.getSeconds()
            // console.log("alarmDateTime",alarmDateTime)
            // console.log("currentDateTime",currentDateTime)

            // console.log(dayDifference,"dayDifference")
            // console.log(monthDifference,"monthDifference")
            // console.log(yearDifference,"yearDifference")
            // console.log(hourDifference,"hourDifference")
            // console.log(minuteDifference,"minuteDifference")
            // console.log(secondDifference,"secondDifference")

          }
      })
	  
    

    }) 

    socket.on('disconnect',()=>{
        console.log("disconnected")
      })
})


// getting user
app.route('/user').get((req,res)=>{
    userModel.find( {} )
		.then(function(data)
    {
		res.json(data);
      
      if(data === null)
      {
		res.end("No data")
      } 
      
    }).catch(function(err)
    {
        res.json({msg:err});	
        console.log(err)
    })

}).post((req,res)=>{
	const response=req.body
	const username=response.username;
	const password=response.password;
	const repeatpass=response.repeatPass;

	if(!username)
	{
			res.json({ msg:"Please Enter Username"})
			return
	}
		if(!password)
	{
        res.json({ msg:"Please Enter Password"})
			
			return
	}
    if(!repeatpass)
	{
        res.json({ msg:"Please Enter Confirm Password"})
			
			return
	}

  if(username && (password ===repeatpass))
  {
					userModel.create(
						{
							username:username,
							password:password

						}
					)
					    .then((data)=>
					    {    
						 res.json({ msg:"Successfully registered"});
						})
						.catch((err)=>
						{
						if(err.code==11000)
						{
						   res.status(401).json({msg:"Username already exists"})
						   return
						}
						console.log(err)
						res.json({ msg:"User Already Exist!!"})
					})
	}
	else
	{
    res.json({ msg:"Enter a valid detail || Password mismatch"})
	}
})

app.route('/user/:id?').get((req,res)=>{
	const _id=req.params.id
    userModel.findOne( {_id} )
		.then(function(data)
    {
		console.log("By id")
		res.json(data);
      
      if(data === null)
      {
		res.end("No data")
		return
      } 
	  return
	  
      
    }).catch(function(err)
    {
        res.json({msg:err});	
        console.log(err)
    })

})

app.get('/alarm/:id?',(req,res)=>{
    const _id=req.params.id
    console.log(_id)
    alarmModel.find( {alarmId:_id} )
		.then(function(data)
    {
		console.log("By id")
  //  console.log(data)
		res.json(data);
      
      if(data === null)
      {
		res.end("No data")
		return
      } 
	  return
	  
      
    }).catch(function(err)
    {
        res.json({msg:err});	
        console.log(err)
    })
})

app.post('/alarm',(req,res)=>{
   const response=req.body
   const username=response.username
   const alarmId=response.alarmId
   const alarmTime=new Date(response.alarmTime)
   console.log(alarmTime)

   if(!username && !alarmId && !alarmTime ){  return res.json({msg:"All field are required"})}
   
   alarmModel.create({
    createdBy:username,
    alarmId,
    alarmTime
   })
   .then((data)=>{
   
    console.log("created alarm")
   })
   .catch((err)=>{
    console.log("Inside Err",err.code)
    if(err.code==11000) return res.json({msg:"Duplicate Alarm can't be save"})
   })
   

})

server.listen(PORT,()=>{
    console.log(`listening at ${PORT}`)
})