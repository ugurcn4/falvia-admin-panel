import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaUpload, FaSave, FaArrowLeft } from 'react-icons/fa';

const AddFortuneTellerPost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fortuneTellers, setFortuneTellers] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    fortune_teller_id: '',
    title: '',
    content: '',
    category: '',
    image_url: '',
    is_published: true,
    is_featured: false
  });

  const categories = [
    'Astroloji',
    'Tarot',
    'Numeroloji',
    'Palmistry',
    'Rüya Yorumu',
    'Genel',
    'Günlük Burç',
    'Aşk Falı'
  ];

  useEffect(() => {
    fetchFortuneTellers();
  }, []);

  const fetchFortuneTellers = async () => {
    try {
      const { data, error } = await supabase
        .from('fortune_tellers')
        .select('id, name, profile_image')
        .order('name');

      if (error) throw error;
      setFortuneTellers(data || []);
    } catch (error) {
      console.error('Falcılar yüklenirken hata:', error);
      showAlert('Falcılar yüklenirken hata oluştu', 'danger');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Dosya boyutu 5MB\'dan küçük olmalıdır', 'danger');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showAlert('Sadece resim dosyaları yüklenebilir', 'danger');
      return;
    }

    try {
      setLoading(true);
      
      // Dosya adını benzersiz yap
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `fortune-teller-posts/${fileName}`;


      // Supabase Storage'a yükle
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filePath, file);

      if (error) {
        console.error('Storage upload hatası:', error);
        throw error;
      }


      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);


      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setImagePreview(URL.createObjectURL(file));
      showAlert('Resim başarıyla yüklendi', 'success');
    } catch (error) {
      console.error('Resim yüklenirken hata:', error);
      showAlert(`Resim yüklenirken hata oluştu: ${error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fortune_teller_id || !formData.title || !formData.content || !formData.category) {
      showAlert('Lütfen tüm zorunlu alanları doldurun', 'danger');
      return;
    }

    try {
      setLoading(true);
      
      
      const { data, error } = await supabase
        .from('fortune_teller_posts')
        .insert([formData])
        .select();

      if (error) {
        console.error('Post oluşturma hatası:', error);
        throw error;
      }

      showAlert('Post başarıyla oluşturuldu', 'success');
      setTimeout(() => {
        navigate('/fortune-teller-posts');
      }, 1500);
    } catch (error) {
      console.error('Post oluşturulurken hata:', error);
      showAlert(`Post oluşturulurken hata oluştu: ${error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🔮 Yeni Falcı Postu</h2>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/fortune-teller-posts')}
          className="d-flex align-items-center gap-2"
        >
          <FaArrowLeft /> Geri Dön
        </Button>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Falcı *</Form.Label>
                  <Form.Select
                    name="fortune_teller_id"
                    value={formData.fortune_teller_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Falcı seçin</option>
                    {fortuneTellers.map(fortuneTeller => (
                      <option key={fortuneTeller.id} value={fortuneTeller.id}>
                        {fortuneTeller.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Başlık *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Post başlığını girin"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Kategori *</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>İçerik *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Post içeriğini girin..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                    label="Postu yayınla"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    label="Öne çıkan post yap"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Resim</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Maksimum dosya boyutu: 5MB
                  </Form.Text>
                </Form.Group>

                {imagePreview && (
                  <div className="mb-3">
                    <Form.Label>Önizleme</Form.Label>
                    <Image
                      src={imagePreview}
                      alt="Önizleme"
                      fluid
                      className="rounded"
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {formData.image_url && !imagePreview && (
                  <div className="mb-3">
                    <Form.Label>Mevcut Resim</Form.Label>
                    <Image
                      src={formData.image_url}
                      alt="Mevcut resim"
                      fluid
                      className="rounded"
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </Col>
            </Row>

            <div className="d-flex gap-2 justify-content-end">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/fortune-teller-posts')}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="d-flex align-items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <FaSave /> Kaydet
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddFortuneTellerPost; 