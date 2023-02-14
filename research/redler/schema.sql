CREATE TABLE user (
    UserID int not null auto_increment,
    UserEmail varchar(255) not null,
    UserPassHash varchar(255) not null,
    UserType int not null default 0, -- 0 Driver, 1 Sponsor, 2 Admin
    PRIMARY (UserID)
);

CREATE TABLE profile (
    UserProfileID int not null,
    ProfileFirstName varchar(255) not null,
    ProfileLastName varchar(255) not null,
    ProfilePhone varchar(12) default '',
    ProfileBio varchar(512) default '',
    ProfilePicture text default '', -- This will be an s3 URL
    primary key (UserProfileID),
    foreign key (UserProfileID) references user(UserID)
);

CREATE TABLE driver (
    DriverID int not null auto_increment,
    DriverUserID int not null,
    DriverSponsorID int not null,
    DriverStatus int not null default 0, -- 0 Unaccepted?
    DriverLicenseNum int not null,
    DriverTruckType varchar(255),
    DriverMilesDriven int,
    primary key (DriverID),
    foreign key (DriverUserID) references user(UserID),
    foreign key (DriverSponsorID) references sponsor(SponsorID),
);

CREATE TABLE admin (
    AdminID int not null auto_increment,
    AdminUserID int not null,
    primary key (AdminID),
    foreign key (AdminUserID) references user(UserID),
);

CREATE TABLE sponsor (
    SponsorID int not null auto_increment,
    SponsorUserID int not null,
    SponsorOrgID int not null,
    primary key (SponsorID),
    foreign key (SponsorUserID) references user(UserID),
    foreign key (SponsorOrgID) references organization(OrgID),
);

CREATE TABLE organization (
    OrgID int not null auto_increment,
    OrgName varchar(255) not null,
    OrgBio varchar(512) default '',
    OrgPhone varchar(12) default '',
    OrgEmail varchar(255) not null,
    OrgLogo text default '', -- This will be an s3 URL
);