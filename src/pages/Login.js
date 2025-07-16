import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await login(email, password);
      
      if (error) {
        setError(error.message || 'Giriş başarısız');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0A0A1A' }}>
      <Container className="d-flex justify-content-center">
        <Card className="bg-card" style={{ maxWidth: '400px', width: '100%' }}>
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2 className="text-secondary mb-2">🔮</h2>
              <h3 className="text-light">Falvia Admin Panel</h3>
              <p className="text-muted">Yönetici girişi</p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>E-posta</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Şifre</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <small className="text-muted">
                Sadece admin yetkisi olan kullanıcılar giriş yapabilir
              </small>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login; 