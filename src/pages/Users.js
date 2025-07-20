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
  Modal
} from 'react-bootstrap';
import { getAllUsers, updateUser } from '../services/supabaseService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal state'leri
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    birth_place: '',
    zodiac_sign: '',
    rising_sign: '',
    gender: '',
    marital_status: '',
    favorite_fortune_teller: '',
    token_balance: '',
    is_admin: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllUsers();
      if (error) {
        setError('Kullanıcılar yüklenirken hata oluştu: ' + error.message);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Düzenle modal işlemleri
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
      birth_place: user.birth_place || '',
      zodiac_sign: user.zodiac_sign || '',
      rising_sign: user.rising_sign || '',
      gender: user.gender || '',
      marital_status: user.marital_status || '',
      favorite_fortune_teller: user.favorite_fortune_teller || '',
      token_balance: user.token_balance || '',
      is_admin: user.is_admin || false
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      full_name: '',
      email: '',
      phone: '',
      birth_date: '',
      birth_place: '',
      zodiac_sign: '',
      rising_sign: '',
      gender: '',
      marital_status: '',
      favorite_fortune_teller: '',
      token_balance: '',
      is_admin: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');

    try {
      // Form validasyonu
      if (!formData.email.trim()) {
        setError('E-posta adresi zorunludur');
        setEditLoading(false);
        return;
      }

      // E-posta formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Geçerli bir e-posta adresi giriniz');
        setEditLoading(false);
        return;
      }

      const updateData = {
        ...formData,
        token_balance: parseInt(formData.token_balance) || 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await updateUser(editingUser.id, updateData);
      
      if (error) {
        setError('Kullanıcı güncellenirken hata oluştu: ' + error.message);
      } else {
        setSuccess('Kullanıcı başarıyla güncellendi');
        handleCloseEditModal();
        loadUsers(); // Listeyi yenile
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.zodiac_sign?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const getZodiacEmoji = (zodiacSign) => {
    const zodiacEmojis = {
      'koç': '♈',
      'boğa': '♉',
      'ikizler': '♊',
      'yengeç': '♋',
      'aslan': '♌',
      'başak': '♍',
      'terazi': '♎',
      'akrep': '♏',
      'yay': '♐',
      'oğlak': '♑',
      'kova': '♒',
      'balık': '♓'
    };
    return zodiacEmojis[zodiacSign?.toLowerCase()] || '⭐';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  return (
    <div>
      {/* Başlık ve Arama Bölümü */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-light mb-1">👥 Kullanıcı Yönetimi</h2>
          <p className="text-muted mb-0">Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Hata ve Başarı Mesajları */}
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

      {/* Arama Kutusu */}
      <Card className="bg-card mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Kullanıcı adı, e-posta, telefon veya burç ile arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                Temizle
              </Button>
            )}
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Kullanıcı Listesi */}
      <Row>
        {filteredUsers.length === 0 ? (
          <Col>
            <Card className="bg-card text-center py-5">
              <Card.Body>
                <div className="fs-1 mb-3">👥</div>
                <h4 className="text-light mb-2">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz kullanıcı kaydı yok'}
                </h4>
                <p className="text-muted">
                  {searchTerm 
                    ? `"${searchTerm}" ile eşleşen kullanıcı bulunamadı`
                    : 'Kullanıcılar henüz sisteme kayıt olmamış'
                  }
                </p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredUsers.map((user) => (
            <Col key={user.id} lg={4} md={6} className="mb-4">
              <Card className="bg-card h-100 border-0 shadow-sm">
                <Card.Body className="p-3">
                  {/* Üst Kısım - Avatar ve Durum */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3" style={{ width: '50px', height: '50px' }}>
                      {user.profile_image && !imageErrors.has(user.id) ? (
                        <img 
                          src={user.profile_image} 
                          alt={user.full_name}
                          className="rounded-circle w-100 h-100 object-fit-cover"
                          style={{ border: '2px solid #FFD700' }}
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(user.id));
                          }}
                        />
                      ) : (
                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center w-100 h-100">
                          <span className="fs-4">👤</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-light mb-1 fw-bold">{user.full_name || 'İsimsiz Kullanıcı'}</h6>
                      <small className="text-muted">{user.email}</small>
                    </div>
                    <Badge 
                      bg={user.is_admin ? "danger" : "success"}
                      className="ms-2"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {user.is_admin ? "Admin" : "Kullanıcı"}
                    </Badge>
                  </div>

                  {/* Orta Kısım - Özet Bilgiler */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">🪙 {user.token_balance || 0} jeton</small>
                      <small className="text-secondary fw-bold">
                        {getZodiacEmoji(user.zodiac_sign)} {user.zodiac_sign || 'Burç yok'}
                      </small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{user.phone || 'Telefon yok'}</small>
                      <small className="text-muted">{formatDate(user.birth_date)}</small>
                    </div>
                  </div>

                  {/* Alt Kısım - Butonlar */}
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="flex-fill"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleEditUser(user)}
                    >
                      ✏️ Düzenle
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* İstatistikler */}
      <Row className="mt-4">
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-secondary mb-1">{users.length}</h3>
              <p className="text-muted mb-0">Toplam Kullanıcı</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-success mb-1">
                {users.filter(user => !user.is_admin).length}
              </h3>
              <p className="text-muted mb-0">Normal Kullanıcı</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-danger mb-1">
                {users.filter(user => user.is_admin).length}
              </h3>
              <p className="text-muted mb-0">Admin Kullanıcı</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-info mb-1">
                {users.filter(user => user.token_balance > 0).length}
              </h3>
              <p className="text-muted mb-0">Jeton Sahibi</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Düzenle Kullanıcı Modalı */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
        <Modal.Header closeButton className="bg-card">
          <Modal.Title className="text-light">✏️ Kullanıcı Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card">
          <Form onSubmit={handleUpdateUser}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ad</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Kullanıcı adı"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Soyad</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Kullanıcı soyadı"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ad Soyad</Form.Label>
                  <Form.Control
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Tam ad soyad"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>E-posta *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Telefon</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+90 555 123 45 67"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Doğum Tarihi</Form.Label>
                  <Form.Control
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Doğum Yeri</Form.Label>
                  <Form.Control
                    type="text"
                    name="birth_place"
                    value={formData.birth_place}
                    onChange={handleInputChange}
                    placeholder="İstanbul, Türkiye"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Burç</Form.Label>
                  <Form.Select
                    name="zodiac_sign"
                    value={formData.zodiac_sign}
                    onChange={handleInputChange}
                  >
                    <option value="">Burç seçin...</option>
                    <option value="koç">Koç</option>
                    <option value="boğa">Boğa</option>
                    <option value="ikizler">İkizler</option>
                    <option value="yengeç">Yengeç</option>
                    <option value="aslan">Aslan</option>
                    <option value="başak">Başak</option>
                    <option value="terazi">Terazi</option>
                    <option value="akrep">Akrep</option>
                    <option value="yay">Yay</option>
                    <option value="oğlak">Oğlak</option>
                    <option value="kova">Kova</option>
                    <option value="balık">Balık</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Yükselen Burç</Form.Label>
                  <Form.Select
                    name="rising_sign"
                    value={formData.rising_sign}
                    onChange={handleInputChange}
                  >
                    <option value="">Yükselen burç seçin...</option>
                    <option value="koç">Koç</option>
                    <option value="boğa">Boğa</option>
                    <option value="ikizler">İkizler</option>
                    <option value="yengeç">Yengeç</option>
                    <option value="aslan">Aslan</option>
                    <option value="başak">Başak</option>
                    <option value="terazi">Terazi</option>
                    <option value="akrep">Akrep</option>
                    <option value="yay">Yay</option>
                    <option value="oğlak">Oğlak</option>
                    <option value="kova">Kova</option>
                    <option value="balık">Balık</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cinsiyet</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Cinsiyet seçin...</option>
                    <option value="erkek">Erkek</option>
                    <option value="kadın">Kadın</option>
                    <option value="diğer">Diğer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Medeni Durum</Form.Label>
                  <Form.Select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleInputChange}
                  >
                    <option value="">Medeni durum seçin...</option>
                    <option value="bekar">Bekar</option>
                    <option value="evli">Evli</option>
                    <option value="nişanlı">Nişanlı</option>
                    <option value="boşanmış">Boşanmış</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Jeton Bakiyesi</Form.Label>
                  <Form.Control
                    type="number"
                    name="token_balance"
                    value={formData.token_balance}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Favori Falcı</Form.Label>
              <Form.Control
                type="text"
                name="favorite_fortune_teller"
                value={formData.favorite_fortune_teller}
                onChange={handleInputChange}
                placeholder="Favori falcı adı"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleInputChange}
                label="Admin Yetkisi"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-card">
          <Button variant="secondary" onClick={handleCloseEditModal}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateUser}
            disabled={editLoading}
          >
            {editLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Güncelleniyor...
              </>
            ) : (
              'Güncelle'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users; 