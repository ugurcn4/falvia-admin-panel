import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { getDashboardStats } from '../services/supabaseService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await getDashboardStats();
      if (error) {
        console.error('Stats error:', error);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Stats load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light mb-0">Dashboard</h2>
        <Badge bg="secondary" className="fs-6">🔮 Falvia Admin Panel</Badge>
      </div>

      <Row>
        <Col md={3} className="mb-4">
          <Card className="bg-card h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <span className="fs-1">👥</span>
              </div>
              <h3 className="text-secondary mb-2">{stats?.totalUsers || 0}</h3>
              <p className="text-muted mb-0">Toplam Kullanıcı</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card className="bg-card h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <span className="fs-1">🔮</span>
              </div>
              <h3 className="text-secondary mb-2">{stats?.totalFortuneTellers || 0}</h3>
              <p className="text-muted mb-0">Toplam Falcı</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card className="bg-card h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <span className="fs-1">☕</span>
              </div>
              <h3 className="text-secondary mb-2">{stats?.totalFortunes || 0}</h3>
              <p className="text-muted mb-0">Toplam Fal</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card className="bg-card h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <span className="fs-1">📖</span>
              </div>
              <h3 className="text-secondary mb-2">{stats?.totalStories || 0}</h3>
              <p className="text-muted mb-0">Toplam Hikaye</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="bg-card h-100">
            <Card.Body>
              <h5 className="text-light mb-3">📊 Aktif Durum</h5>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Müsait Falcılar:</span>
                <Badge bg="success" className="fs-6">
                  {stats?.availableFortuneTellers || 0}
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Bekleyen Fallar:</span>
                <Badge bg="warning" className="fs-6">
                  {stats?.pendingFortunes || 0}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="bg-card h-100">
            <Card.Body>
              <h5 className="text-light mb-3">⚡ Hızlı İşlemler</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-secondary">
                  ➕ Yeni Falcı Ekle
                </button>
                <button className="btn btn-outline-secondary">
                  📖 Yeni Hikaye Ekle
                </button>
                <button className="btn btn-outline-secondary">
                  👥 Kullanıcıları Görüntüle
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="bg-card">
            <Card.Body>
              <h5 className="text-light mb-3">🎯 Sistem Durumu</h5>
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="p-3">
                    <div className="fs-1 text-success">✅</div>
                    <p className="text-muted mb-0">Veritabanı</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <div className="fs-1 text-success">✅</div>
                    <p className="text-muted mb-0">Supabase</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <div className="fs-1 text-success">✅</div>
                    <p className="text-muted mb-0">Admin Panel</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 