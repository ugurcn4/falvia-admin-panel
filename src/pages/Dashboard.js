import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  getDashboardStats, 
  getStoriesOverviewStatistics 
} from '../services/supabaseService';
import { colors } from '../styles/colors';
import { 
  FaUsers, 
  FaUserTie, 
  FaCoffee, 
  FaBookOpen,
  FaPlus,
  FaChartBar,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [storyStats, setStoryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Ana istatistikler
      const { data: mainStats, error: mainError } = await getDashboardStats();
      if (mainError) {
        console.error('Main stats error:', mainError);
      } else {
        setStats(mainStats);
      }

      // Hikaye istatistikleri
      const { data: storiesData, error: storiesError } = await getStoriesOverviewStatistics();
      if (!storiesError) {
        setStoryStats(storiesData);
      }
      
    } catch (error) {
      console.error('Stats load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'add-fortune-teller':
        navigate('/fortune-tellers/add');
        break;
      case 'add-story':
        navigate('/stories/add');
        break;
      case 'view-users':
        navigate('/users');
        break;
      case 'view-stories':
        navigate('/stories');
        break;
      case 'view-statistics':
        navigate('/stories/statistics');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Başlık */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-light mb-0">Dashboard</h2>
          <p className="text-muted mb-0">Falvia Admin Panel - Genel Bakış</p>
        </div>
        <Badge bg="primary" className="fs-6">
          🔮 Falvia Admin Panel
        </Badge>
      </div>

      {/* Ana İstatistik Kartları */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon users">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <h4>{stats?.totalUsers || 0}</h4>
                  <p>Toplam Kullanıcı</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon fortune-tellers">
                  <FaUserTie />
                </div>
                <div className="stat-info">
                  <h4>{stats?.totalFortuneTellers || 0}</h4>
                  <p>Toplam Falcı</p>
                  <small className="text-success">
                    {stats?.availableFortuneTellers || 0} müsait
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon fortunes">
                  <FaCoffee />
                </div>
                <div className="stat-info">
                  <h4>{stats?.totalFortunes || 0}</h4>
                  <p>Toplam Fal</p>
                  <small className="text-warning">
                    {stats?.pendingFortunes || 0} bekliyor
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon stories">
                  <FaBookOpen />
                </div>
                <div className="stat-info">
                  <h4>{storyStats?.totalStories || 0}</h4>
                  <p>Toplam Hikaye</p>
                  <small className="text-info">
                    {storyStats?.activeStories || 0} aktif
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Hızlı İşlemler */}
        <Col lg={6} className="mb-4">
          <Card className="quick-actions-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaPlus className="me-2" />
                Hızlı İşlemler
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="quick-actions-grid">
                <Button 
                  variant="outline-primary" 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('add-fortune-teller')}
                >
                  <FaUserTie className="me-2" />
                  Yeni Falcı Ekle
                </Button>
                
                <Button 
                  variant="outline-success" 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('add-story')}
                >
                  <FaBookOpen className="me-2" />
                  Yeni Hikaye Ekle
                </Button>
                
                <Button 
                  variant="outline-info" 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('view-users')}
                >
                  <FaUsers className="me-2" />
                  Kullanıcıları Görüntüle
                </Button>
                
                <Button 
                  variant="outline-warning" 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('view-stories')}
                >
                  <FaBookOpen className="me-2" />
                  Hikayeleri Görüntüle
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('view-statistics')}
                >
                  <FaChartBar className="me-2" />
                  İstatistikleri Görüntüle
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sistem Durumu */}
        <Col lg={6} className="mb-4">
          <Card className="system-status-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaCheckCircle className="me-2" />
                Sistem Durumu
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="system-status-grid">
                <div className="status-item">
                  <div className="status-icon success">
                    <FaCheckCircle />
                  </div>
                  <div className="status-info">
                    <h6>Veritabanı</h6>
                    <small className="text-success">Bağlantı Aktif</small>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-icon success">
                    <FaCheckCircle />
                  </div>
                  <div className="status-info">
                    <h6>Supabase</h6>
                    <small className="text-success">Çalışıyor</small>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-icon success">
                    <FaCheckCircle />
                  </div>
                  <div className="status-info">
                    <h6>Storage</h6>
                    <small className="text-success">Aktif</small>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-icon success">
                    <FaCheckCircle />
                  </div>
                  <div className="status-info">
                    <h6>Admin Panel</h6>
                    <small className="text-success">Çalışıyor</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Hikaye İstatistikleri */}
      {storyStats && (
        <Row>
          <Col>
            <Card className="story-stats-card">
              <Card.Header>
                <h5 className="mb-0">
                  <FaChartBar className="me-2" />
                  Hikaye İstatistikleri
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div className="story-stat-item">
                      <div className="stat-number">{storyStats.totalViews || 0}</div>
                      <div className="stat-label">Toplam Görüntülenme</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="story-stat-item">
                      <div className="stat-number">%{storyStats.averageCompletionRate || 0}</div>
                      <div className="stat-label">Tamamlanma Oranı</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="story-stat-item">
                      <div className="stat-number">{storyStats.activeStories || 0}</div>
                      <div className="stat-label">Aktif Hikaye</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="story-stat-item">
                      <div className="stat-number">{storyStats.totalStories || 0}</div>
                      <div className="stat-label">Toplam Hikaye</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <style>{`
        .dashboard-page {
          padding: 20px;
        }
        
        .stat-card {
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 12px;
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
        }
        
        .stat-content {
          display: flex;
          align-items: center;
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 1.5rem;
          color: white;
        }
        
        .stat-icon.users {
          background: ${colors.info};
        }
        
        .stat-icon.fortune-tellers {
          background: ${colors.primary};
        }
        
        .stat-icon.fortunes {
          background: ${colors.warning};
        }
        
        .stat-icon.stories {
          background: ${colors.success};
        }
        
        .stat-info h4 {
          margin: 0;
          font-weight: bold;
          color: ${colors.text.primary};
        }
        
        .stat-info p {
          margin: 0;
          color: ${colors.text.secondary};
          font-size: 0.9rem;
        }
        
        .stat-info small {
          font-size: 0.8rem;
        }
        
        .quick-actions-card, .system-status-card, .story-stats-card {
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 12px;
        }
        
        .quick-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .quick-action-btn {
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        
        .system-status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .status-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .status-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        
        .status-icon.success {
          background: ${colors.success};
          color: white;
        }
        
        .status-info h6 {
          margin: 0;
          color: ${colors.text.primary};
          font-size: 0.9rem;
        }
        
        .story-stats-card .row {
          margin: 0;
        }
        
        .story-stat-item {
          text-align: center;
          padding: 15px;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: ${colors.text.primary};
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: ${colors.text.secondary};
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 