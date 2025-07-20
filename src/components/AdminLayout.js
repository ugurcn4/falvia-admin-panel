import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar expand="lg" className="navbar-dark">
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard">
            🔮 Falvia Admin Panel
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/dashboard"
                className={location.pathname === '/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/fortune-tellers"
                className={location.pathname.startsWith('/fortune-tellers') ? 'active' : ''}
              >
                Falcılar
              </Nav.Link>
              <NavDropdown 
                title="Hikayeler" 
                id="stories-nav-dropdown"
                className={location.pathname.startsWith('/stories') ? 'active' : ''}
              >
                <NavDropdown.Item as={Link} to="/stories">
                  Tüm Hikayeler
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/stories/add">
                  Yeni Hikaye
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/stories/statistics">
                  İstatistikler
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link 
                as={Link} 
                to="/users"
                className={location.pathname === '/users' ? 'active' : ''}
              >
                Kullanıcılar
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/fortunes"
                className={location.pathname === '/fortunes' ? 'active' : ''}
              >
                Fallar
              </Nav.Link>
            </Nav>
            
            <Nav>
              <NavDropdown 
                title={`👤 ${user?.profile?.full_name || user?.email}`} 
                id="basic-nav-dropdown"
                className="text-light"
              >
                <NavDropdown.Item onClick={handleLogout}>
                  Çıkış Yap
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className="flex-grow-1 p-4">
        <Container fluid>
          {children}
        </Container>
      </main>
    </div>
  );
};

export default AdminLayout; 