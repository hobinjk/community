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
//  groupIds: [String, ...]
//  has_and_belongs_to_many relations are the best
Students = new Meteor.Collection("students");
Meteor.publish('students', function () {
  return Students.find();
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

