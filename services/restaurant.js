const restaurant = (db) => {
    async function getTables() {
        // get all the available tables
        let result = await db.any('SELECT table_name, capacity, booked FROM table_booking');
       //return all the available tables
        return result;

    }

    async function bookTable(table) {
        // book a table by name
        //It should check if the capacity is not greater than the available seats
        const result = await db.any(`SELECT capacity FROM table_booking  WHERE table_name = '${table.tableName}'`);
        if (result.length == 0){
            return "Invalid table name provided";
        }
        if (result[0].capacity < table.seats) {
            return 'capacity greater than the table seats';
        }
        if (!table.username) {
            return "Please enter a username";
        }
        if (!table.phoneNumber) {
            return 'Please enter a contact number';
        }
        await db.none(`UPDATE table_booking SET username = '${table.username}', number_of_people = '${table.seats}', booked = true, contact_number = '${table.phoneNumber}' WHERE table_name = '${table.tableName}'`)
        //if it is greater than the available seats return a message
    }

    async function getBookedTables() {
        // get all the booked tables
        let bookedTables = await db.any('SELECT * FROM table_booking WHERE booked = true');
        return bookedTables;
    }

    async function isTableBooked(tableName) {
        // get booked table by name
        
        let bookedByName = await db.one(`SELECT booked FROM table_booking WHERE table_name = '${tableName}'`);
        return bookedByName.booked;

    }

    async function cancelTableBooking(tableName) {
        // cancel a table by name
        await db.none(`UPDATE table_booking SET username = null, number_of_people = null, booked = false, contact_number = null WHERE table_name = '${tableName}'`);
    }

    async function getBookedTablesForUser(username) {
        // get user table booking
        let bookedByUserName = await db.any(`SELECT table_name, capacity, booked FROM table_booking WHERE username = '${username}'`);
        return bookedByUserName;
    }

    return {
        getTables,
        bookTable,
        getBookedTables,
        isTableBooked,
        cancelTableBooking,
       // editTableBooking,
        getBookedTablesForUser
    }
}

export default restaurant;