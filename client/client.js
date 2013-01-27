Classes = new Meteor.Collection("classes");
Groups = new Meteor.Collection("groups");
Students = new Meteor.Collection("students");
Interests = new Meteor.Collection("interests");

Meteor.subscribe("classes");
Meteor.subscribe("groups");
Meteor.subscribe("students");
Meteor.subscribe("interests");

Meteor.startup(function() {
  Session.set("showProfile", true);
  Session.set("showGroup", false);

  Meteor.autorun(function() {
    //creates a student for the logged in userid
    //if one doesn't exist already
    //this causes each user to be mirrored by a Student object

    if( Meteor.user()
        && Meteor.user().emails ) {
      //get email address from user to use as name
      var email = Meteor.user().emails[0].address;
      console.log("email: "+email);
      var student = Students.findOne(
          {$and: [{name: email}, {userId: Meteor.userId()}]}
      );
      if(!student) {
        console.log("well hello there");
        Session.set("studentId", Students.insert({
          userId: Meteor.userId(),
          name: email,
          classIds: [],
          interestIds: []
        }));
      } else {
        Session.set("studentId", student._id);
      }
    }
    if( !Meteor.user() ) {
      Session.set("studentId", null);
    }
  });
});
Template.page.studentId = function() {
  return Session.get("studentId");
};

Template.page.showProfile = function() {
  return Session.get("showProfile");
};

Template.page.showGroup = function() {
  return Session.get("showGroup");
};
Template.profile.showJoinGroup = function() {
  return Session.get("showJoinGroup");
};

Template.profile.showJoinClass = function() {
  return Session.get("showJoinClass");
};

Template.profile.data = function() {
  var student = Students.findOne(Session.get("studentId"));
  if(!student) return;
  
  var classes = Classes.find(
    {_id: {$in: student.classIds}}
  );
  return classes.map(function(cls) {
    var className = cls.name;
    console.log("name: "+className+" and id: "+cls._id);
    var group = Groups.findOne({$and: [
        {studentIds: {$in: [Session.get("studentId")]}},
        {classId: cls._id}
    ]});
    console.log("group "+(group ? "exists!" : "is being weird."));
    var groupMembers = group ? Students.find({
        _id: {$in: group.studentIds}
    }) : null;
    console.log("group has "+(groupMembers ? groupMembers.count() : 0)+" members");
    return { 
      "cls": cls,
      "group": group,
      "groupMembers": groupMembers
    };
  });
  
};

Template.profile.interests = function() {
  var student = Students.findOne(Session.get("studentId"));
  if(!student) return;
  var interests = Interests.find({_id: {$in: student.interestIds}}).fetch();

  return Interests.find({}).map(function(n) {
    return {
        _id: n._id,
        name: n.name,
        selected: _.contains(_.pluck(interests,"_id"), n._id)
    };
  });
};

Template.profile.events({
  'click .group': function() {
    Session.set("showProfile", false);
    Session.set("showGroup", true);
    Session.set("selectedGroup", this._id);
  },
  'click .joinGroup': function() {
    Session.set("showJoinGroup", true);
  },
  'click .joinClass': function() {
    Session.set("showJoinClass", true);
  },
  'click .leaveGroup': function() {
    console.log("leaving group");
    console.log(this);
    Groups.update(
      this._id,
      { $pull: {studentIds: Session.get("studentId")} }
    );
  },
  'click .leaveClass': function() {
    console.log("leaving class");
    console.log(this);
    Students.update(
      Session.get("studentId"),
      { $pull: {classIds: this._id} }
    );
    Groups.update(
      {$and: [
        {classId: this._id},
        {studentIds: {$in: [Session.get("studentId")]}}
      ]},
      { $pull: {studentIds: Session.get("studentId")}}
    );
  },
  'click .interest': function() {
    console.log(this);
    if(!this.selected) { //remove, it was selected
      Students.update(
        Session.get("studentId"),
        { $addToSet: {interestIds: this._id} }
      );
    } else { //add, it wasn't selected and now is
      Students.update(
        Session.get("studentId"),
        { $pull: {interestIds: this._id} }
      );
    }
  }
    
});

Template.group.className = function() {
  var group = Groups.findOne(Session.get("selectedGroup"));
  return group.className;
};

Template.group.groupName = function() {
  var group = Groups.findOne(Session.get("selectedGroup"));
  return group.groupName;
};

Template.group.members = function() {
  var group = Groups.findOne(Session.get("selectedGroup"));
  if(!group) return;
  return Meteor.students.find(
    {_id: {$in: group.studentIds}}
  );
};

Template.group.problemSets = function() {
  var group = Groups.findOne(Session.get("selectedGroup"));
  if(!group) return;
  return group.problemSetNames;
};

Template.group.messages = function() {
  //bluh
  return Messages.find(
    {_id: {$in: group.messageIds}}
  );
};

Template.group.meetings = function() {
  return Meetings.find(
    {_id: {$in: group.meetingIds}}
  );
};

Template.joinGroup.groups = function() {
  var student = Students.findOne(Session.get("studentId"));
  if(!student) return;
  console.log("for realsies");
  var classId = this._id;
  if(student.interestIds.length > 0) {
  var ret = _.map(Groups.find(
                  {$and: [
                    {classId: classId},
                    {interestId: {$in: student.interestIds}}
                  ]}).fetch(),
    function(g) {
      return {
        groupName: g.groupName,
        interestName: Interests.findOne(g.interestId).name
      };
    }
  ).concat(
    Groups.find(
      {$and: [
        {classId: classId},
        {interestId: {$nin: student.interestIds}}]
      }
    ).fetch()
  );
  console.log("student has interests");
  console.log(ret);
  return ret;
  }
  else return Groups.find({classId: classId});
  
};

Template.joinClass.classes = function() {
  return Classes.find();
};

Template.joinGroup.events({
  'click .join': function(event, template) {
    console.log(this);
    console.log("oh and trying to join thing with id: "+this._id);
    Groups.update(
      this._id,
      { $addToSet: {studentIds: Session.get("studentId")} }
    );
    Session.set("showJoinGroup", false);
    return false;
  }
});

Template.joinClass.events({
  'click .join': function(event, template) {
    Students.update(
      Session.get("studentId"),
      { $addToSet: {classIds: this._id} }
    );
    Session.set("showJoinClass", false);
    return false;
  }
});

