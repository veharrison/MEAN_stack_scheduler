//This file will contain the model definition of outlets
var mongoose = require('mongoose');

//The schema would have information such as (name, address, contact no. )
var OutletSchema = new mongoose.Schema({
	name: {type:String, unique: true},
	care_taker: String,
	contact_no: Number,
	partner_email: String,    //use this to connect to the owner of outlet
	from: Date,
	to: Date,
	description: String,
	address:{
		address: String,
		city: String,
		country: String,
		pincode: Number,
	}
});


mongoose.model('Outlet', OutletSchema);