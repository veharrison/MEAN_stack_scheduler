var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var Outlet = mongoose.model('Outlet');
var Workout = mongoose.model('Workout');
var jwt = require('express-jwt');
//creating middleware for authenticating jwt tokens
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The Scheduler' });
});
/* POST registering the user*/
router.post('/register',function( req, res, next){
	if(!req.body.email || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.email = req.body.email;

  user.setPassword(req.body.password);

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
})

/*POST logging in*/
router.post('/login', function(req, res, next){
  if(!req.body.email || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

/*Routes for logging in new Outlet and Exercise info*/
router.post('/outlet', auth, function(req, res, next){
  if (!req.body.name || !req.body.contact_no || !req.body.address || !req.body.city){
    return res.status(400).json({message:'Fill the required fiels'});
  }
  if (!req.payload.email){

    return res.status(400).json({message:'You need to mention the email explicitly'});
  }
  var outlet = new Outlet();
  console.log(req.body.from+'THIS IS THE TIME'+req.body.to);
   outlet.name = req.body.name;
   outlet.care_taker = req.body.care_taker;
   outlet.contact_no = req.body.contact_no;
   outlet.partner_email = req.payload.email;
   outlet.from = req.body.from;
   outlet.to = req.body.to;
   outlet.address.address  = req.body.address;
   outlet.address.city = req.body.city;
   outlet.address.country = req.body.country;
   outlet.address.pincode = req.body.pincode;
   outlet.description = req.body.description;

   outlet.save(function(err){
    if(err){
      console.log(err);
      return next(err);
    }
    console.log(err);
    return res.status(200).json(outlet);
   });

});
router.get('/outlet', auth, function(req, res, next){
  Outlet.find({partner_email: req.payload.email}, function(err, outlets){
      if(err){return next(err); }
      res.json(outlets);
  });
});



router.delete('/outlet/:id', auth, function(req, res, next){
  var id = req.params.id;
  Outlet.remove({_id:id}, function(err){
    if(err){
      return next(err);
    }
    return res.status(200).json({"message": "Successfully deleted an outlet "+id});
  })
});

router.post('/workout', auth, function(req, res, next){
  if(!req.body.name || !req.body.day || !req.body.from || !req.body.fitcoin_expense){
    return res.status(400).json({message:"Fill in the required fields"});
  }
  var workout = new Workout();
  workout.name = req.body.name;
  workout.instructor = req.body.instructor;
  workout.day = req.body.day;
  workout.from = req.body.from;
  workout.to = req.body.to;
  workout.instructor_no = req.body.instructor_no;
  workout.fitcoin_expense = req.body.fitcoin_expense;
  workout.partner_email = req.payload.email;
  workout.outlet_id = req.query.id;
  workout.description = req.body.description;

  workout.save(function(err) {
    if(err){
    console.log(err);
      return next(err);
    }
    console.log(err);
    res.status(200).json("New workout added");
  })
});
router.get('/workout', auth, function(req, res, next){
  var id = req.query.id;
  console.log(id);
  Workout.find({outlet_id:id, outlet_name: req.params.workout}, function(err, workouts){
    if(err){
      return next(err);
    }
    res.json(workouts);
  });
});
router.put('/workout', auth, function(req, res, next){
  
});
router.delete('/workout/:id', auth, function(req, res, next){
  var id = req.params.id;
  Workout.remove({_id:id}, function(err){
    if(err){
      return next(err);
    }
    return res.status(200).json({"message": "Successfully deleted an outlet "+id});
  })
});
//route for profiles
router.get('/profile', auth, function(req, res, next){
  User.find({email: req.payload.email}, function(err, profile){
    if(err){
      return next(err);
    }
    res.json(profile);
  })
});

router.post('/profile', auth, function(req, res, next){
  var user = new User();

  console.log(req.body);


  User.findOne({email : req.body.email}, function(err, user) {
    if(err){
      console.log(err);
      return next(err);
    }

  user.username = req.body.username;
  user.contact_no = req.body.contact_no;
  user.description = req.body.description;
  user.address.address = req.body.address.address;
  user.address.city = req.body.address.city;
  user.address.country  = req.body.address.country;
  user.address.pincode = req.body.address.pincode;
  user.save(function(err){
    if(err){
      console.log(err);

      return next(err);
    }
    return res.status(200).json(user);
  })
  });
  

})

module.exports = router;
