var names = [
  "jkirk@mit.edu",
  "spock@mit.edu",
  "bones@mit.edu",
  "scotty@mit.edu",
  "sulu@mit.edu",
  "uhura@mit.edu",
  "chekov@mit.edu",
  "chapel@mit.edu",
  "jrand@mit.edu",
  "picard@mit.edu",
  "riker@mit.edu",
  "data@mit.edu",
  "laforge@mit.edu",
  "worf@mit.edu",
  "bcrusher@mit.edu",
  "pulaski@mit.edu",
  "troi@mit.edu",
  "yar@mit.edu",
  "wcrusher@mit.edu",
  "smith@mit.edu",
  "johnson@mit.edu",
  "williams@mit.edu",
  "jones@mit.edu",
  "brown@mit.edu",
  "davis@mit.edu",
  "miller@mit.edu",
  "wilson@mit.edu",
  "moore@mit.edu",
  "taylor@mit.edu",
  "anderson@mit.edu",
  "thomas@mit.edu",
  "jackson@mit.edu",
  "white@mit.edu",
  "harris@mit.edu",
  "martin@mit.edu",
  "thompson@mit.edu",
  "garcia@mit.edu",
  "martinez@mit.edu",
  "robinson@mit.edu",
  "clark@mit.edu",
  "rodriguez@mit.edu",
  "james@mit.edu",
  "john@mit.edu",
  "robert@mit.edu",
  "michael@mit.edu",
  "william@mit.edu",
  "david@mit.edu",
  "richard@mit.edu",
  "charles@mit.edu",
  "joseph@mit.edu",
  "thomas@mit.edu",
  "christopher@mit.edu",
  "daniel@mit.edu",
  "paul@mit.edu",
  "mark@mit.edu",
  "donald@mit.edu",
  "george@mit.edu",
  "kenneth@mit.edu",
  "steven@mit.edu",
  "jfontaine@mit.edu",
  "mdougall@mit.edu",
  "skelt@mit.edu"
];
var classNames = [
  "6.470",
  "6.00",
  "6.01",
  "6.02",
  "6.S02",
  "6.07J"
];

var adjs = [
  "Awesome",
  "Brilliant",
  "Cool",
  "Dashing",
  "Exceptional",
  "Fancy",
  "Great",
  "Happy",
  "Incredible",
  "Juvenile",
  "Kingly"
];
var mids = [
  "Study",
  "Science"
];
var ends = [
  "Group",
  "Party",
  "Consortium"
];

Meteor.startup(function() {
  if( Classes.find().count() === 0 ) {
    var classIds = _.map(classNames, function(n) {
      return Classes.insert({name: n});
    });
    console.log("classIds");
    console.log(classIds);
    var ids = _.map( names, function(name) {
      return Students.insert({
        'name': name,
        'classIds': classIds
      });
    });
    for(var i = 0; i < names.length; i++) {
      var students = [];
      students.push(Math.floor(Math.random()*ids.length));
      students.push(Math.floor(Math.random()*ids.length));
      students.push(Math.floor(Math.random()*ids.length));
      students.push(Math.floor(Math.random()*ids.length));
      students.push(Math.floor(Math.random()*ids.length));
      students = _.uniq( students );
      
      var classIdx = Math.floor(Math.random()*classIds.length);
      console.log("classId: "+classIds[classIdx]);
      var groupName = adjs[Math.floor(Math.random()*adjs.length)]
          + " " + mids[Math.floor(Math.random()*mids.length)]
          + " " + ends[Math.floor(Math.random()*ends.length)];
      var studentIds = _.map( students, function(s) { return ids[s]; } );
      Groups.insert({
      classId: classIds[classIdx], //whatever
      className: classNames[classIdx],
      groupName: groupName,
      studentIds: studentIds,
      problemSetNames: ["Problem Set 1", "Problem Set 2"]
    });
    }
    
  }
});
