// *** Note: the database connect and table creates are executed when server.js is loaded

// ***** Code below executes when server.js loads and requires(./db)

const Sequelize = require('sequelize');
const {
  STRING,
  INTEGER,
  DATE,
  UUID, 
  UUIDV4
} = Sequelize;

const db = new Sequelize('acme_country_club', 'postgres', 'FSA123', {
  host: 'localhost',
  port: '5432',
  dialect: 'postgres',
  logging: false,
})

let Member, Facility, Booking, MemberBooking;

// ***** Above code executes when server.js loads

// ***** below code only executes when called

async function createTables () {
  await Promise.all([
    Facility = await db.define('facility', {
      id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4, // this is a function to create a UUID
        unique: true
      },
      fac_name: {
        type: STRING(100),
        allowNull: false,
        unique: true
      }
    }),

    Member = await db.define('member', {
      id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
      },
      first_name: {
        type: STRING(20),
        allowNull: false,
        unique: true
      }
    }),

    Booking = await db.define('booking', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      startTime: {
        type: DATE,
        allowNull: false
      },
      endTime: {
        type: DATE,
        allowNull: false
      }
    }),
  ]);

  // create associations / relationships - these all create foreign keys
  Member.belongsTo(Member, { as: 'sponsor' });
  Member.hasMany(Member, {foreignKey: 'sponsorId'})
  Booking.belongsTo(Facility);
  Booking.belongsTo(Member, { as: 'bookedBy' });
  Facility.hasMany(Booking);
  Member.hasMany(Booking, {foreignKey: 'bookedById'});
}

async function syncAndSeed () {
  const memberData = ['moe', 'lucy', 'larry', 'ethyl'];
  const facilityData = ['tennis', 'ping-pong', 'raquet-ball', 'bowling'];

  try {
    await createTables();
    await db.sync({ force: true }) // this forces the creation of tables

    const [moe, lucy, larry, ethyl] = await Promise.all(memberData.map(c => Member.create({ first_name: c })));
    const [tennis, pingPong, raquetBall, bowling] = await Promise.all(facilityData.map(c => Facility.create({ fac_name: c })));
    moe.sponsorId = lucy.id;
    ethyl.sponsorId = moe.id;
    lucy.sponsorId = moe.id;
    larry.sponsorId = lucy.id;
    await Promise.all([lucy.save(),moe.save(), ethyl.save(), larry.save()]);
    await Booking.create({ bookedById : moe.id, facilityId: tennis.id, startTime: new Date(), endTime: new Date().getTime()+(2*1000*60*60)})
    await Booking.create({ bookedById : moe.id, facilityId: tennis.id, startTime: new Date().getTime()+(6*1000*60*60), endTime: new Date().getTime()+(7*1000*60*60)})
    await Booking.create({ bookedById : moe.id, facilityId: bowling.id, startTime: new Date(), endTime: new Date().getTime()+(2*1000*60*60)})
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = {
  syncAndSeed,
  getBookings,
  getMembers,
  getFacilities
}

async function getMembers () {
  const x = await Member.findAll({include: [{model: Member, as: 'sponsor'}, {model: Member}]}); 
  return x.map(c => JSON.stringify(c.dataValues, undefined, 4)).join('');
}

async function getFacilities () {
  const x = await Facility.findAll( {include: {model: Booking}} );
  return x.map(c => JSON.stringify(c.dataValues, undefined, 4)).join('');
}

async function getBookings () {
  const x = await Booking.findAll({include: [{model: Facility, as: 'facility'}, {model : Member, as : 'bookedBy'}]});
  return x.map(c => JSON.stringify(c.dataValues, undefined, 4)).join('');
}