const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let mongoose = require('mongoose')
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new Schema({
  username: String,
})

const User = mongoose.model("User", UserSchema);

const ExercisesSchema = new Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: { type: Date, required: true }
})

const Exercise = mongoose.model("Exercise", ExercisesSchema);

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', async (req, res)=>{
  const userName = new User ({
    username: req.body.username
  })
  const user = await userName.save()
  res.json({
    "username":user.username,
    "_id": user["_id"],
  })
});

app.post('/api/users/:_id/exercises',async (req, res)=>{
  const id = req.params._id;
  const userId = await User.findById(id)
  if ( !userId ){
    return res.json({"error": "User id is not found"})
  } 
  let date = req.body.date ? new Date(req.body.date) : new Date();
  if (isNaN(date)) {
    return res.json({ error: "Invalid date" });
  }
  const exercise = new Exercise({
    user_id: id,
    description: req.body.description,
    duration: req.body.duration,
    date: date
  })
  const exerci = await exercise.save()
  res.json({
    "_id": exerci["user_id"],
    "username":userId.username,
    "date": exerci.date.toDateString(),
    "duration":exerci.duration,
    "description":exerci.description
  })
})


app.get('/api/users', async (req,res)=>{
  const users = await User.find({}).select("_id username")
  res.json(users)
})

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const id = req.params._id;
    const { from, to, limit } = req.query;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    let query = { userId: id };
    
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    let exercises = await Exercise.find({user_id:id});
    console.log(exercises)
    if (limit) exercises = exercises.slice(0, parseInt(limit));
    const log = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString()
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

