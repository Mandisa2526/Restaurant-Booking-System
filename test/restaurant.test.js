import assert, { doesNotMatch } from "assert"
import restaurant from "../services/restaurant.js";
import pgPromise from 'pg-promise';

const DATABASE_URL = 'postgres://restuarant_bookings_user:XES7yGRAmOWAaLxSXk9FOME5sbi15cVL@dpg-cjvc2p95mpss73fbtdr0-a.oregon-postgres.render.com/restuarant_bookings?ssl=true';

const connectionString = process.env.DATABASE_URL || DATABASE_URL;
const db = pgPromise()(connectionString);

describe("The restaurant booking table", function () {
    beforeEach(async function () {
        try {
            this.timeout(10000);
            // clean the tables before each test run
            await db.none("TRUNCATE TABLE table_booking RESTART IDENTITY CASCADE;");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table one', 4, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table two', 6, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table three', 4, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table four', 2, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table five', 6, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table six', 4, false);");
            await db.none("INSERT into table_booking (table_name, capacity, booked) values ('Table eight', 2, false);");
        } catch (err) {
            console.log(err);
            throw err;
        }
    });

    it("Get all the available tables", async function () {
        this.timeout(10000);
        const restaurantTableBooking = restaurant(db);
        const result = await restaurantTableBooking.getTables()
        assert.deepEqual([{ "booked": false, "capacity": 4, "table_name": "Table one" },
        { "booked": false, "capacity": 6, "table_name": "Table two" },
        { "booked": false, "capacity": 4, "table_name": "Table three" },
        { "booked": false, "capacity": 2, "table_name": "Table four" },
        { "booked": false, "capacity": 6, "table_name": "Table five" },
        { "booked": false, "capacity": 4, "table_name": "Table six" },
        { "booked": false, "capacity": 2, "table_name": "Table eight" }], result);
    });


    it("It should check if the capacity is not greater than the available seats.", async function () {
        this.timeout(10000);
        const restaurantTableBooking = restaurant(db);
        const result = await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 3
        });
        
        assert.deepEqual("capacity greater than the table seats", result);
    });

    it("should check if there are available seats for a booking.", async function () {
        const restaurantTableBooking = restaurant(db);

        // get all the tables
        const tables = await restaurantTableBooking.getTables();
        // loop over the tables and see if there is a table that is not booked
        for (let i = 0; i < tables.length; i++) {
            assert.deepEqual(tables[i].booked, false);
        }


    });

    it("Check if the booking has a user name provided.", async function () {
        const restaurantTableBooking = restaurant(db);

        assert.deepEqual("Please enter a username", await restaurantTableBooking.bookTable({
            tableName: 'Table eight',
            phoneNumber: '084 009 8910',
            seats: 2
        }));
    });

    it("Check if the booking has a contact number provided.", async function () {
        const restaurantTableBooking =  restaurant(db);
        assert.deepEqual("Please enter a contact number", await restaurantTableBooking.bookTable({
            tableName: 'Table eight',
            username: 'Kim',
            seats: 2
        }));
    });

    it("should not be able to book a table with an invalid table name.", async function () {
        const restaurantTableBooking = restaurant(db);

       let message = await restaurantTableBooking.bookTable({
            tableName: 'Table ten',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 2
        });

        assert.deepEqual("Invalid table name provided", message);
    });

    it("should be able to book a table.", async function () {
        let restaurantTableBooking = restaurant(db);
        // Table three should not be booked
        assert.equal(false, await restaurantTableBooking.isTableBooked('Table three'));
        // book Table three

        await restaurantTableBooking.bookTable({
            tableName: 'Table three',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 2
        });

        // Table three should be booked now
        const booked = await restaurantTableBooking.isTableBooked('Table three')
        assert.equal(true, booked);
    });

    it("should list all booked tables.", async function () {
        this.timeout(10000);
        let restaurantTableBooking = restaurant(db);

        await restaurantTableBooking.bookTable({
            tableName: 'Table three',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 2
        });

        let tables = await restaurantTableBooking.getBookedTables();

        assert.deepEqual([         {
            "booked": true,
            "capacity": 4,
            "contact_number": "084 009 8910",
            "id": 3,
            "number_of_people": 2,
            "table_name": "Table three",
            "username": "Kim",
        }] , tables);
    });

    it("should allow users to book tables", async function () {
        this.timeout(10000);
        let restaurantTableBooking = restaurant(db);

        assert.deepEqual([], await restaurantTableBooking.getBookedTablesForUser('Jodie'));

        await restaurantTableBooking.bookTable({
            tableName: 'Table five',
            username: 'Jodie',
            phoneNumber: '084 009 8910',
            seats: 4
        });

        await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Jodie',
            phoneNumber: '084 009 8910',
            seats: 2
        });

        await restaurantTableBooking.bookTable({
            tableName: 'Table five',
            username: 'Jodie',
            phoneNumber: '084 009 8910',
            seats: 4
        })

        // should only return 2 bookings as two of the bookings were for the same table
        assert.deepEqual([{"booked": true, "capacity": 2, "table_name": "Table four"}, {"booked": true, "capacity": 6, "table_name": "Table five"}], await restaurantTableBooking.getBookedTablesForUser('Jodie'));
    });

    it("should be able to cancel a table booking", async function () {
        this.timeout(10000);
        let restaurantTableBooking = restaurant(db);

        await restaurantTableBooking.bookTable({
            tableName: 'Table five',
            username: 'Jodie',
            phoneNumber: '084 009 8910',
            seats: 4
        });

        await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 2
        });

        let bookedTables = await restaurantTableBooking.getBookedTables();
        assert.equal(2, bookedTables.length);

        await restaurantTableBooking.cancelTableBooking("Table four");

        bookedTables = await restaurantTableBooking.getBookedTables();
        assert.equal(1, bookedTables.length);
    });

    after(function () {
        db.$pool.end;
    });
})
