//Classes = {
//  name: String
Classes = new Meteor.Collection("classes");
Meteor.publish('classes', function () {
  return Classes.find();
});

//Students = {
//  userId: String, matches to userId,
//  name: String, is a name
//  classIds: [String, ...]
//  groupIds: [String, ...] what no
//  has_and_belongs_to_many relations are the best
Students = new Meteor.Collection("students");
Meteor.publish('students', function (id, user, groups) {
  if(!id && !user && !groups) {
    return Students.find(); //fuck this, fuck everything
  }
  if(id) {
    var studids = [id];
    if(groups) {
      console.log(groups);
    _.each(groups, function(group) {
      if(!group) return;
      studids = studids.concat(group.studentIds);
      
    });
    console.log("got groups length "+groups.length+" out of "+Groups.find().count());
    }
    console.log(studids);
    return Students.find(
      {_id: {$in: studids}}
    );
  } else { //not even slightly logged in, be a special person for them
    if(!user) return;
    if(!user.emails) return;
    var email = user.emails[0].address;
    if(!email) return;
    return Students.find(
        {$and: [{name: email}, {userId: user._id}]}
    );
  }
  return;
});

//Groups = {
//  classId: String,
//  groupName: String,
//  studentIds: [String ...],
//  problemSetNames: [String ...],
//  messageIds: [String ...],
//  meetingIds: [String ...]

Groups = new Meteor.Collection("groups");
Meteor.publish("groups", function() {
  return Groups.find();
});

//Interests = {
//  name: String
Interests = new Meteor.Collection("interests");
Meteor.publish("interests", function() {
  return Interests.find();
});

//Meetings = {
//  date: Date,
//  description: String
Meetings=  new Meteor.Collection("meetings");
Meteor.publish("meetings", function() {
  return Meetings.find();
});

//Messages = {
//  username: String,
//  text: String
Messages = new Meteor.Collection("messages");
Meteor.publish("messages", function() {
  return Messages.find();
});
