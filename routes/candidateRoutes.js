const express = require("express");
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const candidate = require('../models/candidate');


const checkAdmimRole = async (userID) => {
  try{
    const user = await User.findById(userID);
    if (user.role === 'admin') {
      return true;
    }
  }catch(err){
    return false;
  }

}

// post route to add a candidate
  router.post('/', jwtAuthMiddleware, async (req, res)=>{
try{
  if(! await checkAdmimRole(req.user.id))
    return res.status(403).json({message: 'user is not admin'});
  
  const data = req.body //assuming the request body contains the candidate data

  //create a new candidate document using the mongoose model
  const newCandidate = new candidate(data);

  //save the new candidate to the database
  const response = await newCandidate.save();
  console.log('data saved')

  const payload ={
    id: response.id
  }
  console.log(JSON.stringify(payload));
  const token = generateToken(payload);
  console.log("Token is : ", token);
  res.status(200).json({response: response});
}
catch(err){
  console.log(err);
  res.status(500).json({error: 'internl server error'});
}
})


router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
  try{ 
     if(!checkAdmimRole(req.user.id))
    return res.status(403).json({message: 'user is not admin'});
  
   const candidateID = req.params.candidateID; //extract the id from the url parameter
    const updateCandidateData = req.body; //update data for the person
   
    const response = await candidate.findByIdAndUpdate(candidateID, updateCandidateData,{
    new: true, //return the updated document
    runValidators: true, //run mongoose validation
   })

   if (!response){
    return res.status(404).json({error: 'Candidate not found'});
   }

   console.log('Candidate data updated');
   res.status(200).json(response);
  }
  catch(err){
    console.log(err);
       res.status(500).json({error: 'internl server error'});
  }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
  try{ 
     if(!checkAdmimRole(req.user.id))
    return res.status(404).json({message: 'user is not admin'});
  
   const candidateID = req.params.candidateID; //extract the id from the url parameter
   const updateCandidateData = req.body; //delete data of the candidate
    const response = await candidate.findByIdAndDelete(candidateID);

   if (!response){
    return res.status(403).json({error: 'Candidate not found'});
   }

   console.log('Candidate data deleted');
   res.status(200).json(response);
  }
  catch(err){
    console.log(err);
       res.status(500).json({error: 'internl server error'});
  }
})
module.exports = router;