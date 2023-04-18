import React from 'react';
import { render, screen } from '@testing-library/react';
import ApplicationsCard from '../../components/DashboardCards/ApplicationsCard';
import CatalogCard from '../../components/DashboardCards/CatalogCard';
import NotificationsCard from '../../components/DashboardCards/NotificationsCard';
import OrdersCard from '../../components/DashboardCards/OrdersCard';
import OrganizationsCard from '../../components/DashboardCards/OrganizationsCard';
import PointsHistoryCard from '../../components/DashboardCards/PointsHistoryCard';
import ProfileCard from '../../components/DashboardCards/ProfileCard';
import ReportsCard from '../../components/DashboardCards/ReportsCard';
import { UserClaims } from '../../utils/getUserClaims';
import LogsCard from '../../components/DashboardCards/LogsCard';

//Driver Tests
test('CatalogCard logged in with user "testDriver"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "testDriver", id: 1, }
    render(<CatalogCard {...claims} />);
  
    const linkElement = screen.getByText("Catalog");
    
    expect(linkElement).toBeInTheDocument();
});

test('PointsHistoryCard logged in with user "testDriver"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "testDriver", id: 1, }
    render(<PointsHistoryCard {...claims} />);
  
    const linkElement = screen.getByText("Points History");
    
    expect(linkElement).toBeInTheDocument();
});

test('NotificationsCard logged in with user "testDriver"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "testDriver", id: 1, }
    render(<NotificationsCard {...claims} />);
  
    const linkElement = screen.getByText("Notifications");
    
    expect(linkElement).toBeInTheDocument();
});

test('OrdersCard logged in with user "testDriver"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "testDriver", id: 1, }
    render(<OrdersCard {...claims} />);
  
    const linkElement = screen.getByText("Orders");
    
    expect(linkElement).toBeInTheDocument();
});

test('ApplicationsCard logged in with user "testDriver"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "testDriver", id: 1, }

    render(<ApplicationsCard {...claims} />);
  
    const linkElement = screen.getByText("Applications");
    
    expect(linkElement).toBeInTheDocument();
});

test('ProfileCard logged in with user "testDriver"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "testDriver", id: 1, }
    render(<ProfileCard {...claims} />);
  
    const linkElement = screen.getByText("Profile");
    
    expect(linkElement).toBeInTheDocument();
});

test('OrganizationsCard logged in with user "testDriver"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "testDriver", id: 1, }
    render(<OrganizationsCard {...claims} />);
  
    const linkElement = screen.getByText("Organizations");
    
    expect(linkElement).toBeInTheDocument();
});

//Sponsor Tests

test('CatalogCard logged in with user "testSponsor"', () => {
    var claims: UserClaims = { authorized: true, role: 1, user: "testSponsor", id: 2, }
    render(<CatalogCard {...claims} />);
  
    const linkElement = screen.getByText("Catalog");
    
    expect(linkElement).toBeInTheDocument();
});

test('PointsHistoryCard logged in with user "testSponsor"', () => {
    var claims: UserClaims = { authorized: true, role: 1, user: "testSponsor", id: 2, }
    render(<PointsHistoryCard {...claims} />);
  
    const linkElement = screen.getByText("Points History");
    
    expect(linkElement).toBeInTheDocument();
});

test('NotificationsCard logged in with user "testSponsor"', () => {
    var claims: UserClaims = { authorized: true, role: 1, user: "testSponsor", id: 2, }
    render(<NotificationsCard {...claims} />);
  
    const linkElement = screen.getByText("Notifications");
    
    expect(linkElement).toBeInTheDocument();
});

test('OrdersCard logged in with user "testSponsor"', () => {
    var claims: UserClaims = { authorized: true, role: 1, user: "testSponsor", id: 2, }
    render(<OrdersCard {...claims} />);
  
    const linkElement = screen.getByText("Orders");
    
    expect(linkElement).toBeInTheDocument();
});

test('ApplicationsCard logged in with user "testSponsor"', () => {
    var claims: UserClaims = { authorized: true, role: 1, user: "testSponsor", id: 2, }

    render(<ApplicationsCard {...claims} />);
  
    const linkElement = screen.getByText("Applications");
    
    expect(linkElement).toBeInTheDocument();
});

test('ProfileCard logged in with user "testSponsor"', () => {
    var claims: UserClaims = { authorized: true, role: 1, user: "testSponsor", id: 2, }
    render(<ProfileCard {...claims} />);
  
    const linkElement = screen.getByText("Profile");
    
    expect(linkElement).toBeInTheDocument();
});

test('OrganizationsCard logged in with user "testSponsor"', () => {
    var claims: UserClaims = { authorized: true, role: 1, user: "testSponsor", id: 2, }
    render(<OrganizationsCard {...claims} />);
  
    const linkElement = screen.getByText("Organizations");
    
    expect(linkElement).toBeInTheDocument();
});

test('ReportsCard logged in with user "testSponsor"', () => {
    var claims: UserClaims = { authorized: true, role: 1, user: "testSponsor", id: 2, }
    render(<ReportsCard {...claims} />);
  
    const linkElement = screen.getByText("Reports");
    
    expect(linkElement).toBeInTheDocument();
});

//Admin Tests

test('CatalogCard logged in with user "testAdmin"', () => {
    var claims: UserClaims = { authorized: true, role: 2, user: "testAdmin", id: 3, }
    render(<CatalogCard {...claims} />);
  
    const linkElement = screen.getByText("Catalog");
    
    expect(linkElement).toBeInTheDocument();
});

test('PointsHistoryCard logged in with user "testAdmin"', () => {
    var claims: UserClaims = { authorized: true, role: 2, user: "testAdmin", id: 3, }
    render(<PointsHistoryCard {...claims} />);
  
    const linkElement = screen.getByText("Points History");
    
    expect(linkElement).toBeInTheDocument();
});

test('NotificationsCard logged in with user "testAdmin"', () => {
    var claims: UserClaims = { authorized: true, role: 2, user: "testAdmin", id: 3, }
    render(<NotificationsCard {...claims} />);
  
    const linkElement = screen.getByText("Notifications");
    
    expect(linkElement).toBeInTheDocument();
});

test('OrdersCard logged in with user "testAdmin"', () => {
    var claims: UserClaims = { authorized: true, role: 2, user: "testAdmin", id: 3, }
    render(<OrdersCard {...claims} />);
  
    const linkElement = screen.getByText("Orders");
    
    expect(linkElement).toBeInTheDocument();
});

test('ProfileCard logged in with user "testAdmin"', () => {
    var claims: UserClaims = { authorized: true, role: 2, user: "testAdmin", id: 3, }
    render(<ProfileCard {...claims} />);
  
    const linkElement = screen.getByText("Profile");
    
    expect(linkElement).toBeInTheDocument();
});

test('OrganizationsCard logged in with user "testAdmin"', () => {
    var claims: UserClaims = { authorized: true, role: 2, user: "testAdmin", id: 3, }
    render(<OrganizationsCard {...claims} />);
  
    const linkElement = screen.getByText("Organizations");
    
    expect(linkElement).toBeInTheDocument();
});

test('ReportsCard logged in with user "testAdmin"', () => {
    var claims: UserClaims = { authorized: true, role: 2, user: "testAdmin", id: 3, }
    render(<ReportsCard {...claims} />);
  
    const linkElement = screen.getByText("Reports");
    
    expect(linkElement).toBeInTheDocument();
});

test('LogsCard logged in with user "testAdmin"', () => {
    var claims: UserClaims = { authorized: true, role: 2, user: "testAdmin", id: 3, }
    render(<LogsCard {...claims} />);
  
    const linkElement = screen.getByText("Logs");
    
    expect(linkElement).toBeInTheDocument();
});