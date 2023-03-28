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

test('ApplicationsCard logged in with user "test"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "test", id: 1, }

    render(<ApplicationsCard {...claims} />);
  
    const linkElement = screen.getByText("Applications");
    
    expect(linkElement).toBeInTheDocument();
});

test('CatalogCard logged in with user "test"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "test", id: 1, }
    render(<CatalogCard {...claims} />);
  
    const linkElement = screen.getByText("Catalog");
    
    expect(linkElement).toBeInTheDocument();
});

test('NotificationsCard logged in with user "test"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "test", id: 1, }
    render(<NotificationsCard {...claims} />);
  
    const linkElement = screen.getByText("Notifications");
    
    expect(linkElement).toBeInTheDocument();
});

test('OrdersCard logged in with user "test"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "test", id: 1, }
    render(<OrdersCard {...claims} />);
  
    const linkElement = screen.getByText("Orders");
    
    expect(linkElement).toBeInTheDocument();
});

test('OrganizationsCard logged in with user "test"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "test", id: 1, }
    render(<OrganizationsCard {...claims} />);
  
    const linkElement = screen.getByText("Organizations");
    
    expect(linkElement).toBeInTheDocument();
});

test('PointsHistoryCard logged in with user "test"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "test", id: 1, }
    render(<PointsHistoryCard {...claims} />);
  
    const linkElement = screen.getByText("Points History");
    
    expect(linkElement).toBeInTheDocument();
});

test('ProfileCard logged in with user "test"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "test", id: 1, }
    render(<ProfileCard {...claims} />);
  
    const linkElement = screen.getByText("Profile");
    
    expect(linkElement).toBeInTheDocument();
});

test('ReportsCard logged in with user "test"', () => {
    var claims: UserClaims = { authorized: true, role: 0, user: "test", id: 1, }
    render(<ReportsCard {...claims} />);
  
    const linkElement = screen.getByText("Reports");
    
    expect(linkElement).toBeInTheDocument();
});