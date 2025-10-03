import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  InputGroup,
  Badge,
  Spinner,
  Alert,
  Modal,
  Tabs,
  Tab,
  Table,
  ButtonGroup
} from 'react-bootstrap';
import { 
  FaBell, 
  FaPaperPlane, 
  FaUsers, 
  FaCrown, 
  FaUser,
  FaHistory,
  FaCheck,
  FaTimes,
  FaEye
} from 'react-icons/fa';
import { 
  getAllUsers, 
  sendNotificationToUsers, 
  getNotificationHistory,
  markNotificationAsRead 
} from '../services/supabaseService';
import { colors } from '../styles/colors';

const Notifications = () => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('send');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetType: 'all', // all, premium, specific
    specificUsers: []
  });

  // Modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    loadUsers();
    loadNotificationHistory();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await getAllUsers();
      if (error) {
        setError('Kullanıcılar yüklenirken hata oluştu: ' + error.message);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const { data, error } = await getNotificationHistory();
      if (error) {
        setError('Bildirim geçmişi yüklenirken hata oluştu: ' + error.message);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTargetTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      targetType: type,
      specificUsers: []
    }));
  };

  const getTargetUsers = () => {
    switch (formData.targetType) {
      case 'all':
        return users;
      case 'premium':
        return users.filter(user => user.is_premium);
      case 'nonPremium':
        return users.filter(user => !user.is_premium);
      case 'specific':
        return users.filter(user => formData.specificUsers.includes(user.id));
      default:
        return [];
    }
  };

  const handlePreview = () => {
    const targetUsers = getTargetUsers();
    setPreviewData({
      ...formData,
      targetUsers,
      userCount: targetUsers.length
    });
    setShowPreviewModal(true);
  };

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Başlık ve içerik alanları zorunludur.');
      return;
    }

    const targetUsers = getTargetUsers();
    if (targetUsers.length === 0) {
      setError('Bildirim gönderilecek kullanıcı bulunamadı.');
      return;
    }

    try {
      setSending(true);
      setError('');
      
      const { success: sendSuccess, error: sendError } = await sendNotificationToUsers({
        title: formData.title,
        content: formData.content,
        targetType: formData.targetType,
        userIds: targetUsers.map(user => user.id)
      });

      if (sendError) {
        setError('Bildirim gönderilirken hata oluştu: ' + sendError.message);
      } else {
        setSuccess(`Bildirim başarıyla ${targetUsers.length} kullanıcıya gönderildi!`);
        setFormData({
          title: '',
          content: '',
          targetType: 'all',
          specificUsers: []
        });
        setShowPreviewModal(false);
        loadNotificationHistory(); // Geçmişi yenile
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getTargetTypeBadge = (type) => {
    switch (type) {
      case 'all':
        return <Badge bg="primary">Tüm Kullanıcılar</Badge>;
      case 'premium':
        return <Badge bg="warning">Premium Üyeler</Badge>;
      case 'nonPremium':
        return <Badge bg="secondary">Ücretsiz Üyeler</Badge>;
      case 'specific':
        return <Badge bg="info">Seçili Kullanıcılar</Badge>;
      default:
        return <Badge bg="dark">Bilinmeyen</Badge>;
    }
  };

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2 className="text-light">
            <FaBell className="me-3" style={{ color: colors.secondary }} />
            Bildirim Yönetimi
          </h2>
          <p className="text-secondary">
            Kullanıcılara push notification gönder ve bildirim geçmişini yönet
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        variant="pills"
      >
        <Tab eventKey="send" title={<><FaPaperPlane className="me-2" />Bildirim Gönder</>}>
          <Card style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <Card.Header style={{ backgroundColor: colors.primary, color: colors.text.light }}>
              <h5 className="mb-0">
                <FaPaperPlane className="me-2" />
                Yeni Bildirim Gönder
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-light">Başlık *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Bildirim başlığı..."
                        maxLength={50}
                        style={{ 
                          backgroundColor: colors.background, 
                          border: `1px solid ${colors.border}`,
                          color: colors.text.light
                        }}
                      />
                      <Form.Text className="text-secondary">
                        {formData.title.length}/50 karakter
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-light">Hedef Kitle</Form.Label>
                      <ButtonGroup className="w-100">
                        <Button
                          variant={formData.targetType === 'all' ? 'primary' : 'outline-secondary'}
                          onClick={() => handleTargetTypeChange('all')}
                          size="sm"
                        >
                          <FaUsers className="me-1" />
                          Tümü ({users.length})
                        </Button>
                        <Button
                          variant={formData.targetType === 'premium' ? 'warning' : 'outline-secondary'}
                          onClick={() => handleTargetTypeChange('premium')}
                          size="sm"
                        >
                          <FaCrown className="me-1" />
                          Premium ({users.filter(u => u.is_premium).length})
                        </Button>
                        <Button
                          variant={formData.targetType === 'nonPremium' ? 'secondary' : 'outline-secondary'}
                          onClick={() => handleTargetTypeChange('nonPremium')}
                          size="sm"
                        >
                          <FaUser className="me-1" />
                          Ücretsiz ({users.filter(u => !u.is_premium).length})
                        </Button>
                      </ButtonGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="text-light">İçerik *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Bildirim içeriği..."
                    maxLength={200}
                    style={{ 
                      backgroundColor: colors.background, 
                      border: `1px solid ${colors.border}`,
                      color: colors.text.light
                    }}
                  />
                  <Form.Text className="text-secondary">
                    {formData.content.length}/200 karakter
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={handlePreview}
                    disabled={!formData.title.trim() || !formData.content.trim()}
                  >
                    <FaEye className="me-2" />
                    Önizleme
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleSendNotification}
                    disabled={sending || !formData.title.trim() || !formData.content.trim()}
                  >
                    {sending ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="me-2" />
                        Bildirim Gönder
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="history" title={<><FaHistory className="me-2" />Bildirim Geçmişi</>}>
          <Card style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <Card.Header style={{ backgroundColor: colors.primary, color: colors.text.light }}>
              <h5 className="mb-0">
                <FaHistory className="me-2" />
                Gönderilen Bildirimler
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="light" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-secondary">
                  <FaBell size={48} className="mb-3 opacity-50" />
                  <p>Henüz bildirim gönderilmemiş.</p>
                </div>
              ) : (
                <Table responsive variant="dark">
                  <thead>
                    <tr>
                      <th>Başlık</th>
                      <th>İçerik</th>
                      <th>Hedef</th>
                      <th>Gönderim Tarihi</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification) => (
                      <tr key={notification.id}>
                        <td>{notification.title}</td>
                        <td>
                          {notification.content.length > 50 
                            ? notification.content.substring(0, 50) + '...'
                            : notification.content
                          }
                        </td>
                        <td>{getTargetTypeBadge(notification.target_type)}</td>
                        <td>{formatDate(notification.created_at)}</td>
                        <td>
                          <Badge bg="success">
                            <FaCheck className="me-1" />
                            Gönderildi
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Önizleme Modal */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Modal.Title style={{ color: colors.text.light }}>
            <FaEye className="me-2" />
            Bildirim Önizlemesi
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: colors.card, color: colors.text.light }}>
          {previewData && (
            <>
              <div className="mb-3">
                <h6 style={{ color: colors.secondary }}>Bildirim İçeriği:</h6>
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: colors.background, 
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <strong>{previewData.title}</strong>
                  <br />
                  <span className="text-secondary">{previewData.content}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <h6 style={{ color: colors.secondary }}>Hedef Kitle:</h6>
                <p>
                  {getTargetTypeBadge(previewData.targetType)}
                  <span className="ms-2 text-secondary">
                    ({previewData.userCount} kullanıcı)
                  </span>
                </p>
              </div>

              {previewData.userCount > 0 && (
                <div>
                  <h6 style={{ color: colors.secondary }}>Hedef Kullanıcılar:</h6>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {previewData.targetUsers.slice(0, 10).map((user) => (
                      <div key={user.id} className="d-flex align-items-center mb-2">
                        <div className="flex-grow-1">
                          <small>{user.full_name || `${user.first_name} ${user.last_name}`}</small>
                          <br />
                          <small className="text-secondary">{user.email}</small>
                        </div>
                        {user.is_premium && (
                          <Badge bg="warning" size="sm">
                            Premium
                          </Badge>
                        )}
                      </div>
                    ))}
                    {previewData.userCount > 10 && (
                      <small className="text-secondary">
                        ... ve {previewData.userCount - 10} kullanıcı daha
                      </small>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            İptal
          </Button>
          <Button 
            variant="success" 
            onClick={handleSendNotification}
            disabled={sending}
          >
            {sending ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <FaPaperPlane className="me-2" />
                Gönder
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notifications; 