CREATE TABLE table_booking (
    id serial not null primary key,
    table_name text not null,
    capacity int not null,
    booked boolean not null,
    username text,
    number_of_people int,
    contact_number varchar(32),
);