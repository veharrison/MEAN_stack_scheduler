
var mongoose = require('mongoose');

var WorkoutSchema = new mongoose.Schema({
	name: String,
	instructor: String,
	day: String,
	from: Date,
	to: Date,
	instructor_no: Number,
	fitcoin_expense: Number,
	partner_email: String,   // use this to connect to the partner
	outlet_id: String,	// use this to connect to an outlet
	description: String,
});

mongoose.model('Workout', WorkoutSchema);