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

var interests  = [
  "Nerf",
  "LARPing",
  "Magic: The Gathering",
  "Ascension",
  "Dominion",
  "Settlers of Catan",
  "Star Trek",
  "Star Wars",
  "Lord of the Rings",
  "Buffy the Vampire Slayer",
  "Community",
  "Firefly",
  "Adventure Time",
  "Gravity Falls",
  "Marvel",
  "DC",
  "Benedict Cumberbatch",
  "My Little Pony: Friendship is Magic",
  "4chan",
  "reddit",
  "Hacking",
  "Tea",
  "Knitting",
  "Crochet",
  "Baking",
  "Cooking",
  "Dancing",
  "Drinking",
  "Thrift Shop",
  "Music",
  "Acting",
  "Starcraft",
  "Writing",
  "League of Legends",
  "DotA",
  "Television",
  "Movies",
  "Torrenting",
  "Reading",
  "Science-fiction",
  "Rocky Horror Picture Show",
  "Monty Python",
  "Loki",
  "Fantasy",
  "Mythology",
  "Basketball",
  "Soccer",
  "Football",
  "Hockey",
  "Archery",
  "Pistol",
  "Rifle",
  "Sailing",
  "Battlestar Galactica",
  "Harry Potter",
  "Anime",
  "Manga",
  "Chocolate",
  "Meat",
  "Puzzles",
  "Naruto",
  "Dubstep",
  "Alternative",
  "Indie",
  "Rock",
  "Pop",
  "Jazz",
  "Classical",
  "Baroque",
  "Death Metal",
  "Filk",
  "Metal",
  "Hair Dyeing",
  "Scott Pilgrim vs. the World",
  "Diplomacy",
  "Debate",
  "Supernatural",
  "Tumblr",
];

var messageTexts = [
  "Hello world!",
  "Hey world!",
  "Lorem ipsum",
  "Dolor sit amet!",
];

Meteor.startup(function() {
  if( Classes.find().count() === 0 ) {
    //inserts classes for 
    var classIds = _.map(classNames, function(n) {
      return Classes.insert({name: n});
    });
    var interestIds = _.map(interests, function(n) {
      return Interests.insert({name: n});
    });

    var ids = _.map( names, function(name) {
      return Students.insert({
        'name': name,
        'classIds': classIds,
        'interestIds': _.filter(interestIds, function(n) {
            return _.random(0,interestIds.length-1) < 15;
        })
      });
    });
    
    for(var i = 0; i < names.length; i++) {
      //get a random interest to base the group off of
      var interestId = interestIds[_.random(interestIds.length-1)];
      //get all students interested in this interest
      var students = Students.find({interestIds: {$in: [interestId]}}, {_id: 1}).fetch();
      //retrieve id value and shuffle the stuff
      studentIds = _.chain(students).pluck("_id").shuffle().value();
      if(studentIds.length < 2) //no one wants a study group with 1 or 0 people
        continue;
      //limit the returned student ids to at most 6
      studentIds = studentIds.slice(0,Math.min(5,studentIds.length));
      //get a random class
      //because all students are involved in all classes
      //this can't fail
      var classIdx = _.random(classIds.length-1);
      console.log("classId: "+classIds[classIdx]);
      var groupName = adjs[Math.floor(Math.random()*adjs.length)]
          + " " + mids[Math.floor(Math.random()*mids.length)]
          + " " + ends[Math.floor(Math.random()*ends.length)];

      var messageIds = new Array(2);
      for(var j = 0; j < 2; j++)
        messageIds[j] = Messages.insert({
          username: students[_.random(students.length-1)].name,
          text: messageTexts[_.random(messageTexts.length-1)]
        });

      var meetingIds = new Array(4);
      for(var j = 0; j < 4; j++)
        meetingIds[j] = Meetings.insert({
          date: new Date(new Date().getTime() + 1000*60*60*24*(1+j)),
          description: "Meeting "+j
        });
      
      Groups.insert({
        interestId: interestId,
        classId: classIds[classIdx], //whatever
        className: classNames[classIdx],
        messageIds: messageIds,
        meetingIds: meetingIds,
        groupName: groupName,
        studentIds: studentIds,
      });
    }
    
  }
});
