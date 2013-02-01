Classes = new Meteor.Collection("classes");
Groups = new Meteor.Collection("groups");
Students = new Meteor.Collection("students");
Interests = new Meteor.Collection("interests");
Messages = new Meteor.Collection("messages");
Meetings = new Meteor.Collection("meetings");

Meteor.subscribe("classes");
Meteor.subscribe("groups");
Meteor.autosubscribe(function() {
  //var gs = Groups.find({
  //  _id: {$in: [Session.get("studentId")]}
  //}).fetch();
  //console.log("gs: "+gs.length);
  //Meteor.subscribe("students", Session.get("studentId"), Meteor.user(), gs);
  Meteor.subscribe("students");
});
Meteor.subscribe("interests");
Meteor.subscribe("messages");
Meteor.subscribe("meetings");

Meteor.startup(function() {
  Session.set("showProfile", true);
  Session.set("showGroup", false);

  Meteor.autorun(function() {
    getStudent();
    /*if( Meteor.user()
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
    }*/
    
  });
});

function getStudent() {
  //hu blooh hooh hooh
  if(Session.get("studentId")) {
    var stud = Students.findOne(Session.get("studentId"))
    if(stud) return stud;
  }
  if(Meteor.user() && Meteor.user().emails) {
    var email = Meteor.user().emails[0].address;
    stud = Students.findOne(
      {$and: [{name: email}, {userId: Meteor.userId()}]}
    );
    if(stud) {
      Session.set("studentId", stud._id);
      return stud;
    }
    console.log("unable to find any students, oops");
    stud = Students.insert({
      userId: Meteor.userId(),
      name: email,
      classIds: [],
      interestIds: []
    });
    Session.set("studentId", stud._id);
    return stud;
  }
  return;
}

Template.page.studentExists = function() {
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
  var student = getStudent();
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

Template.profile.interests = function(column, totalColumns) {
  var student = getStudent();
  if(!student) return;
  var interests = Interests.find({_id: {$in: student.interestIds}}).fetch();
  var count = Interests.find().count();
  var start = column*count/totalColumns;
  return Interests.find({},{skip:start,limit:count/totalColumns}).map(function(n) {
    return {
        _id: n._id,
        name: n.name,
        selected: _.contains(_.pluck(interests,"_id"), n._id)
    };
  });
};

Template.profile.events({
  'click .showGroup': function() {
    Session.set("showProfile", false);
    Session.set("showGroup", true);
    Session.set("selectedGroup", this._id);
    Session.set("showAddMeeting", false); //stupid
  },
  'click .showJoinGroup': function(event) {
    Session.set("showJoinGroup", true);
    event.preventDefault();
  },
  'click .showJoinClass': function(event) {
    Session.set("showJoinClass", true);
    event.preventDefault();
  },
  'click .leaveGroup': function() {
    console.log("leaving group");
    console.log(this);
    Groups.update(
      this._id,
      { $pull: {studentIds: Session.get("studentId")} }
    );
    event.preventDefault();
  },
  'click .leaveClass': function(event, t) {
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
    event.preventDefault();
  },
  'click .interest': function(event, t) {
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
    event.preventDefault();
  }
});


Template.group.groupName = function() {
  var group = Groups.findOne(Session.get("selectedGroup"));
  if(!group) return;
  return group.groupName;
};

Template.group.className = function() {
  var group = Groups.findOne(Session.get("selectedGroup"));
  if(!group) return;
  return group.className;
};

Template.group.members = function() {
  var group = Groups.findOne(Session.get("selectedGroup"));
  if(!group) return;
  return Students.find(
    {_id: {$in: group.studentIds}}
  );
};

Template.group.messages = function() {
  var group = Groups.findOne(Session.get("selectedGroup"));
  if(!group) return;
  return Messages.find(
    {_id: {$in: group.messageIds}}
  );
};

Template.group.meetings = function() {
  var group = Groups.findOne(Session.get("selectedGroup"));
  if(!group) return;
  if(!group.meetingIds) return;
  return _.map(Meetings.find(
    {$and : [  
        {_id: {$in: group.meetingIds}},
        {date: {$gte: new Date()}}
     ]},
    {sort: {date: -1}}).fetch(), function(m) {
      var d = new Date(m.date);
      return {
        _id: m._id,
        date: d,
        dateString: (d.getMonth()+1)+"/"+d.getDate()+" "+d.getHours()+":"+d.getMinutes(),
        description: m.description
      };
    });
};

Template.joinGroup.groups = function() {
  var student = getStudent();
  if(!student) return;
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
        interestName: Interests.findOne(g.interestId).name,
        _id: g._id,
        studentIds: g.studentIds
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
  return ret;
  }
  else return Groups.find({classId: classId});
  
};

Template.joinClass.classes = function() {
  return Classes.find();
};

Template.joinGroup.events({
  'click .joinGroup': function(event, template) {
    console.log(this);
    console.log("oh and trying to join thing with id: "+this._id);
    Groups.update(
      this._id,
      { $addToSet: {studentIds: Session.get("studentId")} }
    );
    Session.set("showJoinGroup", false);
    event.preventDefault();
    return false;
  }
});

Template.joinClass.events({
  'click .joinClass': function(event, template) {
    Students.update(
      Session.get("studentId"),
      { $addToSet: {classIds: this._id} }
    );
    Session.set("showJoinClass", false);
    event.preventDefault();
    return false;
  }
});

Template.group.showAddMeeting = function() {
  return Session.get("showAddMeeting");
};

Template.group.events({
  'click .showAddMeeting': function(evt, template) {
    Session.set("showAddMeeting", true);
    console.log("showAddMeeting");
    evt.preventDefault();
    return false;
  },
  'keydown #messageInput': function(evt, t) {
    if (evt.type === "keydown" && evt.which === 13) {
      var id = Messages.insert({
        username: Students.findOne(Session.get("studentId")).name,
        text: evt.target.value
      });
      Groups.update(
        Session.get("selectedGroup"),
        { $addToSet: { messageIds: id } }
      );
      evt.target.value = "";
      evt.preventDefault();
    
    }
  },
  'click .showProfile': function(e,t) {
    Session.set("showProfile", true);
    Session.set("showGroup", false);
  }
});

Template.addMeeting.events({
  'click .addMeeting': function(evt, tmpl) {
    var date = $("#datepicker").datepicker("getDate");
    var desc = tmpl.find("#meetingDescription").value;
    var hour = parseInt($("#hour").val(), 10);
    var minute = parseInt($("#minute").val(), 10);
    date.setHours(hour);
    date.setMinutes(minute);
    console.log("START");
    console.log(date);
    console.log(desc);
    var id = Meetings.insert({
      'date': date,
      'description': desc
    });
    console.log(id);
    Groups.update(
      Session.get("selectedGroup"),
      { $addToSet: {meetingIds: id} }
    );
    Session.set("showAddMeeting", false);
    evt.preventDefault();
    return false;
  }
});

Template.addMeeting.rendered = function() {
  $("#datepicker").datepicker();
};


