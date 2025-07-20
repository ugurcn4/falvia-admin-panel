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
import { getAllFortuneTellers, deleteFortuneTeller, createFortuneTeller, updateFortuneTeller } from '../services/supabaseService';

const FortuneTellers = () => {
  const [fortuneTellers, setFortuneTellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal state'leri
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingFortuneTeller, setEditingFortuneTeller] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    profile_image: '',
    bio: '',
    experience_years: '',
    specialties: '',
    price_per_fortune: '',
    rank: 'başlangıç',
    is_available: true,
    rating: 0,
    total_readings: 0
  });

  useEffect(() => {
    loadFortuneTellers();
  }, []);

  const loadFortuneTellers = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllFortuneTellers();
      if (error) {
        setError('Falcılar yüklenirken hata oluştu: ' + error.message);
      } else {
        setFortuneTellers(data || []);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu falcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await deleteFortuneTeller(id);
        if (error) {
          setError('Falcı silinirken hata oluştu: ' + error.message);
        } else {
          setSuccess('Falcı başarıyla silindi');
          loadFortuneTellers(); // Listeyi yenile
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Beklenmeyen bir hata oluştu');
      }
    }
  };

  // Modal işlemleri
  const handleShowAddModal = () => {
    setShowAddModal(true);
    setFormData({
      name: '',
      profile_image: '',
      bio: '',
      experience_years: '',
      specialties: '',
      price_per_fortune: '',
      rank: 'başlangıç',
      is_available: true,
      rating: 0,
      total_readings: 0
    });
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      name: '',
      profile_image: '',
      bio: '',
      experience_years: '',
      specialties: '',
      price_per_fortune: '',
      rank: 'başlangıç',
      is_available: true,
      rating: 0,
      total_readings: 0
    });
  };

  // Düzenle modal işlemleri
  const handleEditFortuneTeller = (fortuneTeller) => {
    setEditingFortuneTeller(fortuneTeller);
    setFormData({
      name: fortuneTeller.name || '',
      profile_image: fortuneTeller.profile_image || '',
      bio: fortuneTeller.bio || '',
      experience_years: fortuneTeller.experience_years || '',
      specialties: Array.isArray(fortuneTeller.specialties) ? fortuneTeller.specialties.join(', ') : '',
      price_per_fortune: fortuneTeller.price_per_fortune || '',
      rank: fortuneTeller.rank || 'başlangıç',
      is_available: fortuneTeller.is_available || true,
      rating: fortuneTeller.rating || 0,
      total_readings: fortuneTeller.total_readings || 0
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingFortuneTeller(null);
    setFormData({
      name: '',
      profile_image: '',
      bio: '',
      experience_years: '',
      specialties: '',
      price_per_fortune: '',
      rank: 'başlangıç',
      is_available: true,
      rating: 0,
      total_readings: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddFortuneTeller = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');

    try {
      // Form validasyonu
      if (!formData.name.trim()) {
        setError('Falcı adı zorunludur');
        setAddLoading(false);
        return;
      }

      const fortuneTellerData = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        price_per_fortune: parseInt(formData.price_per_fortune) || 0,
        rating: parseFloat(formData.rating) || 0,
        total_readings: parseInt(formData.total_readings) || 0,
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
        created_at: new Date().toISOString()
      };

      const { error } = await createFortuneTeller(fortuneTellerData);
      
      if (error) {
        setError('Falcı eklenirken hata oluştu: ' + error.message);
      } else {
        setSuccess('Falcı başarıyla eklendi');
        handleCloseAddModal();
        loadFortuneTellers(); // Listeyi yenile
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateFortuneTeller = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');

    try {
      // Form validasyonu
      if (!formData.name.trim()) {
        setError('Falcı adı zorunludur');
        setEditLoading(false);
        return;
      }

      const updateData = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        price_per_fortune: parseInt(formData.price_per_fortune) || 0,
        rating: parseFloat(formData.rating) || 0,
        total_readings: parseInt(formData.total_readings) || 0,
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
        updated_at: new Date().toISOString()
      };

      const { error } = await updateFortuneTeller(editingFortuneTeller.id, updateData);
      
      if (error) {
        setError('Falcı güncellenirken hata oluştu: ' + error.message);
      } else {
        setSuccess('Falcı başarıyla güncellendi');
        handleCloseEditModal();
        loadFortuneTellers(); // Listeyi yenile
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredFortuneTellers = fortuneTellers.filter(fortuneTeller =>
    fortuneTeller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fortuneTeller.specialties?.join(', ').toLowerCase().includes(searchTerm.toLowerCase()) ||
    fortuneTeller.rank?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-light mb-1">🔮 Falcı Yönetimi</h2>
          <p className="text-muted mb-0">Sistemdeki tüm falcıları görüntüleyin ve yönetin</p>
        </div>
        <Button variant="primary" size="lg" onClick={handleShowAddModal}>
          ➕ Yeni Falcı Ekle
        </Button>
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
              placeholder="Falcı adı, e-posta veya uzmanlık alanı ile arayın..."
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

      {/* Falcı Listesi */}
      <Row>
        {filteredFortuneTellers.length === 0 ? (
          <Col>
            <Card className="bg-card text-center py-5">
              <Card.Body>
                <div className="fs-1 mb-3">🔮</div>
                <h4 className="text-light mb-2">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz falcı eklenmemiş'}
                </h4>
                <p className="text-muted">
                  {searchTerm 
                    ? `"${searchTerm}" ile eşleşen falcı bulunamadı`
                    : 'İlk falcıyı eklemek için "Yeni Falcı Ekle" butonuna tıklayın'
                  }
                </p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredFortuneTellers.map((fortuneTeller) => (
            <Col key={fortuneTeller.id} lg={3} md={4} sm={6} className="mb-4">
              <Card className="bg-card h-100 border-0 shadow-sm">
                <Card.Body className="p-3">
                  {/* Üst Kısım - Avatar ve Durum */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3" style={{ width: '50px', height: '50px' }}>
                      {fortuneTeller.profile_image && !imageErrors.has(fortuneTeller.id) ? (
                        <img 
                          src={fortuneTeller.profile_image} 
                          alt={fortuneTeller.name}
                          className="rounded-circle w-100 h-100 object-fit-cover"
                          style={{ border: '2px solid #FFD700' }}
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(fortuneTeller.id));
                          }}
                        />
                      ) : (
                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center w-100 h-100">
                          <span className="fs-4">🔮</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-light mb-1 fw-bold">{fortuneTeller.name}</h6>
                      <small className="text-muted">{fortuneTeller.rank}</small>
                    </div>
                    <Badge 
                      bg={fortuneTeller.is_available ? "success" : "secondary"}
                      className="ms-2"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {fortuneTeller.is_available ? "●" : "○"}
                    </Badge>
                  </div>

                  {/* Orta Kısım - Özet Bilgiler */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">⭐ {fortuneTeller.rating || 0}</small>
                      <small className="text-secondary fw-bold">🪙 {fortuneTeller.price_per_fortune || 0}</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{fortuneTeller.experience_years || 0}y</small>
                      <small className="text-muted">{fortuneTeller.total_readings || 0} fal</small>
                    </div>
                  </div>

                  {/* Alt Kısım - Butonlar */}
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="flex-fill"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleEditFortuneTeller(fortuneTeller)}
                    >
                      ✏️
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleDelete(fortuneTeller.id)}
                    >
                      🗑️
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
              <h3 className="text-secondary mb-1">{fortuneTellers.length}</h3>
              <p className="text-muted mb-0">Toplam Falcı</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-success mb-1">
                {fortuneTellers.filter(ft => ft.is_available).length}
              </h3>
              <p className="text-muted mb-0">Müsait Falcı</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-warning mb-1">
                {fortuneTellers.filter(ft => !ft.is_available).length}
              </h3>
              <p className="text-muted mb-0">Meşgul Falcı</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-info mb-1">
                {fortuneTellers.filter(ft => ft.experience_years >= 5).length}
              </h3>
              <p className="text-muted mb-0">Deneyimli (5+ yıl)</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Yeni Falcı Ekle Modalı */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg" centered>
        <Modal.Header closeButton className="bg-card">
          <Modal.Title className="text-light">➕ Yeni Falcı Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card">
          <Form onSubmit={handleAddFortuneTeller}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Falcı Adı *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Falcı adı"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Seviye/Rütbe</Form.Label>
                  <Form.Select
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                  >
                    <option value="başlangıç">Başlangıç</option>
                    <option value="orta">Orta</option>
                    <option value="uzman">Uzman</option>
                    <option value="usta">Usta</option>
                    <option value="master">Master</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Uzmanlık Alanları</Form.Label>
                  <Form.Control
                    type="text"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    placeholder="Kahve falı, Tarot, Astroloji (virgülle ayırın)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fal Başına Ücret (Jeton)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price_per_fortune"
                    value={formData.price_per_fortune}
                    onChange={handleInputChange}
                    placeholder="50"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Deneyim (Yıl)</Form.Label>
                  <Form.Control
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    placeholder="5"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Puan</Form.Label>
                  <Form.Control
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="4.5"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Profil Resmi URL</Form.Label>
              <Form.Control
                type="url"
                name="profile_image"
                value={formData.profile_image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hakkında</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Falcı hakkında kısa bilgi..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                    label="Müsait"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Toplam Fal Sayısı</Form.Label>
                  <Form.Control
                    type="number"
                    name="total_readings"
                    value={formData.total_readings}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-card">
          <Button variant="secondary" onClick={handleCloseAddModal}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddFortuneTeller}
            disabled={addLoading}
          >
            {addLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Ekleniyor...
              </>
            ) : (
              'Falcı Ekle'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Düzenle Falcı Modalı */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
        <Modal.Header closeButton className="bg-card">
          <Modal.Title className="text-light">✏️ Falcı Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card">
          <Form onSubmit={handleUpdateFortuneTeller}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Falcı Adı *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Falcı adı"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Seviye/Rütbe</Form.Label>
                  <Form.Select
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                  >
                    <option value="başlangıç">Başlangıç</option>
                    <option value="orta">Orta</option>
                    <option value="uzman">Uzman</option>
                    <option value="usta">Usta</option>
                    <option value="master">Master</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Uzmanlık Alanları</Form.Label>
                  <Form.Control
                    type="text"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    placeholder="Kahve falı, Tarot, Astroloji (virgülle ayırın)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fal Başına Ücret (Jeton)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price_per_fortune"
                    value={formData.price_per_fortune}
                    onChange={handleInputChange}
                    placeholder="50"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Deneyim (Yıl)</Form.Label>
                  <Form.Control
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    placeholder="5"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Puan</Form.Label>
                  <Form.Control
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="4.5"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Profil Resmi URL</Form.Label>
              <Form.Control
                type="url"
                name="profile_image"
                value={formData.profile_image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hakkında</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Falcı hakkında kısa bilgi..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                    label="Müsait"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Toplam Fal Sayısı</Form.Label>
                  <Form.Control
                    type="number"
                    name="total_readings"
                    value={formData.total_readings}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-card">
          <Button variant="secondary" onClick={handleCloseEditModal}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateFortuneTeller}
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

export default FortuneTellers; 